import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/server/db';
import { VerificationStatus } from '@prisma/client';
import { findOldestUnverifiedMessage } from '@/utils/helper';
import { authMiddlewareNode } from '@/server/authMiddleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    // Authenticate the requester
    const decodedToken = await authMiddlewareNode(req, res);
    if (!decodedToken) {
        return; // The authMiddleware has already sent a response
    }

    const { operationId, chatId, messageId } = req.query;

    try {
        // First, get the current message status and ensure the message exists
        const operation = await db.operation.findUnique({
            where: { id: operationId as string },
        });

        if (!operation) {
            return res.status(404).json({ message: 'Operation not found' });
        }

        // Check if the authenticated user is the doctor for this operation
        if (operation.doctorId !== decodedToken.uid) {
            return res.status(403).json({ message: 'Unauthorized: You are not the doctor for this operation' });
        }

        const chat = operation.chats.find(chat => chat.id === chatId);
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        const message = chat.messages.find(message => message.id === messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        const currentStatus = message.verificationStatus;

        if (currentStatus !== VerificationStatus.VERIFIED) {
            // Update the message verification status only if it's not already verified
            const updateOperations: any = {
                where: { id: operationId as string },
                data: {
                    chats: {
                        updateMany: {
                            where: { id: chatId as string },
                            data: {
                                messages: {
                                    updateMany: {
                                        where: { id: messageId as string },
                                        data: {
                                            verificationStatus: VerificationStatus.VERIFIED,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            };

            // Only decrement numUnverifiedMessages if the message is currently unverified
            if (currentStatus === VerificationStatus.UNVERIFIED) {
                updateOperations.data.chats.updateMany.data.numUnverifiedMessages = { decrement: 1 };
                updateOperations.data.chats.updateMany.data.oldestUnverifiedMessage = (await findOldestUnverifiedMessage(chat, messageId as string))?.timestamp;
            }

            await db.operation.update(updateOperations);

            res.status(200).json({ message: 'Message verified successfully' });
        } else {
            res.status(200).json({ message: 'Message already verified' });
        }
    } catch (error) {
        console.error('Error verifying message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
