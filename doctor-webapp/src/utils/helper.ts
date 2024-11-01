import { Chat, VerificationStatus } from '@prisma/client';

export async function findOldestUnverifiedMessage(chat: Chat, excludeMessageId: string) {
    const unverifiedMessages = chat.messages.filter(message => 
        message.verificationStatus === VerificationStatus.UNVERIFIED && message.id !== excludeMessageId
    );

    if (unverifiedMessages.length === 0) {
        return null; // No unverified messages left
    }

    return unverifiedMessages.reduce((oldest, message) => 
        new Date(message.timestamp) < new Date(oldest.timestamp) ? message : oldest
    );
}