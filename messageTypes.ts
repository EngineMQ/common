import { Static, Type } from '@sinclair/typebox';




/* Client side */

export type ClientMessageType = 'hello' | 'heartbeat' | 'subscribe' | 'publish' | 'deliveryAck' | 'deliveryResolve' | 'deliveryReject';

export type ClientMessageHello = Static<typeof ClientMessageHello>;
export const ClientMessageHello = Type.Object({
    clientId: Type.String(),
    maxWorkers: Type.Number(),
    version: Type.String(),
    authToken: Type.String(),
});

export type ClientMessageHeartbeat = Static<typeof ClientMessageHeartbeat>;
export const ClientMessageHeartbeat = Type.Object({});

export type ClientMessageSubscribe = Static<typeof ClientMessageSubscribe>;
export const ClientMessageSubscribe = Type.Object({
    subscriptions: Type.Array(Type.String()),
});
export enum MessageQos {
    Normal = 1,
    Feedback = 2,
}
export enum MessagePriority {
    Urgent = 0,
    High = 1,
    Normal = 2,
    Low = 3,
    Lazy = 4
}
export const MAX_MESSAGE_PRIORITY = 4;

export type ClientMessagePublishOptions = Static<typeof ClientMessagePublishOptions>;
export const ClientMessagePublishOptions = Type.Object({
    messageId: Type.String(),
    qos: Type.Enum(MessageQos),
    priority: Type.Enum(MessagePriority),
    delayMs: Type.Optional(Type.Number()),
    expirationMs: Type.Optional(Type.Number()),
});
export const MESSAGE_ID_LENGTH_MAX = 32;
export const MESSAGE_ID_MASK = `^[a-z0-9]{1,${MESSAGE_ID_LENGTH_MAX}}$`;
export const MESSAGE_ID_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';
export const MESSAGE_ID_LENGTH_DEFAULT = 20;

export const TOPIC_LENGTH_MAX = 128;
export const TOPIC_MASK = /^([\da-z]+\.)*[\da-z]+$/;
export const TOPIC_WILDCARD_MASK = /^(([\da-z]+|[#*])\.)*([\da-z]+|[#*])$/;

export type ClientMessagePublish = Static<typeof ClientMessagePublish>;
export const ClientMessagePublish = Type.Object({
    topic: Type.String(),
    message: Type.Object({}),
    options: ClientMessagePublishOptions,
});

export type ClientMessageDeliveryAck = Static<typeof ClientMessageDeliveryAck>;
export const ClientMessageDeliveryAck = Type.Object({
    messageId: Type.String(),
    percent: Type.Optional(Type.Number()),
    resolveReason: Type.Optional(Type.Object({})),
    rejectReason: Type.Optional(Type.Object({})),
    rejectRetryDelayMs: Type.Optional(Type.Number()),
});




/* Broker side */

export type BrokerMessageType = 'welcome' | 'heartbeat' | 'publishAck' | 'delivery' | 'deliveryreport';

export type BrokerMessageWelcome = Static<typeof BrokerMessageWelcome>;
export const BrokerMessageWelcome = Type.Object({
    version: Type.String(),
    heartbeatSec: Type.Integer(),
    errorCode: Type.Optional(Type.String()),
    errorMessage: Type.Optional(Type.String()),
});

export type BrokerMessageHeartbeat = Static<typeof BrokerMessageHeartbeat>;
export const BrokerMessageHeartbeat = Type.Object({});

export type BrokerMessagePublishAck = Static<typeof BrokerMessagePublishAck>;
export const BrokerMessagePublishAck = Type.Object({
    messageId: Type.String(),
    errorCode: Type.Optional(Type.String()),
    errorMessage: Type.Optional(Type.String()),
});
export type BrokerMessageDelivery = Static<typeof BrokerMessageDelivery>;
export const BrokerMessageDelivery = Type.Intersect([
    ClientMessagePublish,
    Type.Object({
        source: Type.Object({
            sourceClientId: Type.String(),
            publishTime: Type.Number(),
        })
    })
]);

export type BrokerMessageDeliveryReport = Static<typeof BrokerMessageDeliveryReport>;
export const BrokerMessageDeliveryReport = ClientMessageDeliveryAck;
