/* eslint-disable @typescript-eslint/no-inferrable-types */
import {
  DiscriminatorKey,
  Model,
  MongooseSchema,
  ObjectID,
  Ref,
  Schema,
  VirtualRef,
} from "@tsed/mongoose";
import {
  CollectionOf,
  Default,
  Enum,
  Format,
  ForwardGroups,
  Groups,
  MinItems,
  OneOf,
  Property,
  Required,
} from "@tsed/schema";

export enum PostType {
  TEXT = "post-text",
  QUESTION = "post-question",
  POLL = "post-poll",
  SCHEDULING = "post-scheduling",
  EVENT = "post-event",
  SHARED = "post-shared",
}

export enum PostContentType {
  PLAIN = "plain",
  DRAFTJS = "draftjs",
}
@Schema()
export class PostContentSchema {
  @Required()
  rawContent: string;

  @Required()
  @Enum(PostContentType)
  contentType: PostContentType;
}

@Model({
  collection: "comm_posts",
  schemaOptions: {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    autoCreate: true,
  },
})
export class PostEntity {
  @Property(String)
  @Required()
  @ObjectID("id")
  @Groups("!post.create")
  _id: string;

  @Property()
  @Groups("!post.create")
  createdAt: Date;

  @Required()
  commentable: boolean;

  @Required()
  @DiscriminatorKey()
  @MongooseSchema({ $skipDiscriminatorCheck: true })
  @Enum(PostType)
  postType: PostType;

  @Required()
  content: PostContentSchema;

  @Required()
  @Groups("!post.create")
  @OneOf(() => CommentEntity)
  @VirtualRef({
    ref: "CommentEntity",
    localField: "_id",
    foreignField: "post",
    justOne: false,
  })
  comments: CommentEntity[];

  @Required()
  @Groups("!post.create")
  @VirtualRef({
    ref: "CommentEntity",
    localField: "_id",
    foreignField: "post",
    count: true,
  })
  commentsCount: number;
}

@Model({
  collection: "comm_comments",
  schemaOptions: {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    autoCreate: true,
  },
})
export class CommentEntity {
  @Property(String)
  @Required()
  @ObjectID("id")
  @Groups("!comment.create")
  _id: string;

  @Required()
  @Groups("!comment.create")
  @Default(Date.now)
  createdAt: Date = new Date();

  @Required()
  @Ref(PostEntity)
  @Groups("!comment.create")
  post: Ref<PostEntity>;

  @Property()
  @Ref(() => CommentEntity)
  replyTo?: Ref<CommentEntity>;

  @Required()
  content: PostContentSchema;
}

@Model({
  discriminatorValue: "post-text",
})
export class TextPostEntity extends PostEntity {}

@Model({
  discriminatorValue: "post-question",
})
export class QuestionPostEntity extends PostEntity {}

@Model({
  discriminatorValue: "post-poll",
  schemaOptions: {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  },
})
export class PollPostEntity extends PostEntity {
  @Required()
  @CollectionOf(String)
  @MinItems(2)
  responseOptions: string[];

  @Required()
  allowAdditionalResponseOptions: boolean;

  @Required()
  allowMultipleSelection: boolean;

  @Required()
  anonymous: boolean;
}

@Model({
  discriminatorValue: "post-scheduling",
  schemaOptions: {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  },
})
export class SchedulingPostEntity extends PostEntity {
  @Required()
  allowAdditionalResponseOptions: boolean;

  @Required()
  allowMultipleSelection: boolean;

  @Required()
  allowNoAnswerFit: boolean;
}

@Schema()
export class EventLocationSchema {
  @Required()
  name: string;

  @Property()
  @Default("")
  extra: string = "";

  @Property()
  @Default("")
  street: string = "";

  @Property()
  @Default("")
  zip: string = "";

  @Property()
  @Default("")
  city: string = "";

  @Property()
  @Default("")
  country: string = "";
}

export enum EventCategory {
  EVENT = "event",
  PARTY = "party",
  CONFERENCE = "conference",
  FAIR = "fair",
  ONLINE = "online",
  SEMINAR = "seminar",
  CONFERENCE_CALL = "conference-call",
  WORKSHOP = "workshop",
}

export enum EventRegistrationMode {
  NO = "no",
  INTERNAL = "internal",
  EXTERNAL = "external",
}

@Model({
  discriminatorValue: "post-event",
})
export class EventPostEntity extends PostEntity {
  @Required()
  title: string;

  @Required()
  @Format("date-time")
  startDate: Date;

  @Property()
  @Format("date-time")
  endDate?: Date;

  @Required()
  fullday: boolean;

  @Required()
  onSite: boolean;

  @Required()
  remote: boolean;

  @Property()
  remoteInfo?: string;

  @Property()
  location?: EventLocationSchema;

  @Property()
  @Enum(EventCategory)
  category: EventCategory;

  @Required()
  @Enum(EventRegistrationMode)
  registrationMode: EventRegistrationMode;

  @Property()
  saveTheDate?: boolean;

  @Property()
  maxParticipants?: number;

  @Property()
  closeRegistrationWithMaxParticipants?: number;

  @Property()
  paid?: boolean;

  @Property()
  costs?: string;

  @Property()
  openParticipantsList: boolean;

  @Property()
  registrationLink?: string;

  @Property()
  @Format("date-time")
  deadline?: Date;
}

@Model({
  discriminatorValue: "post-shared",
})
export class SharedPostEntity extends PostEntity {
  @Required()
  sharedFrom: Ref<PostEntity>;
}
