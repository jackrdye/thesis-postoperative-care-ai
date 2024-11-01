import { Message, SenderType, VerificationStatus } from "@prisma/client";
import ReactMarkdown from 'react-markdown';

export default function MessageBubble({ msg }: { msg: Message }) {
  if (msg.sender == SenderType.AI) {
    const containerClass = "justify-start";
    const baseClass = "max-w-xs sm:max-w-md px-4 m-[0.25rem] py-2 rounded-lg";
    if (!msg.verificationStatus || msg.verificationStatus === VerificationStatus.UNVERIFIED) {
      // AI Message has not been verified by doctor
      return (
        <div className={`flex ${containerClass}`}>
          <div className={`${baseClass} bg-red-200`}>
            <ReactMarkdown className="markdown">{msg.text}</ReactMarkdown>
            <div>
              <span className="text-xs font-semibold">(Unverified by Doctor)</span>
            </div>
          </div>
        </div>
      );
    }
    else if (msg.verificationStatus === VerificationStatus.VERIFIED) {
      // AI Message has been verified by doctor and it has no issues
      return (
        <div className={`flex ${containerClass}`}>
          <div className={`${baseClass} bg-green-200`}>
            <ReactMarkdown className="markdown">{msg.text}</ReactMarkdown>
            <div>
              <span className="text-xs font-semibold">(Verified by Doctor)</span>
            </div>
          </div>
        </div>
      );
    }
    else if (msg.verificationStatus === VerificationStatus.AMENDED) {
      // AI Message has been verified by doctor and the doctor has added a comment
      return (
        <div className={`flex ${containerClass}`}>
          <div className={`${baseClass} bg-orange-200`}>
            <ReactMarkdown className="markdown">{msg.text}</ReactMarkdown>
            <div>
              {/* <span className="text-xs font-semibold">(Verified by Doctor)</span> */}
              <div className="text-md"><span className="font-semibold">(Doctor Comment):</span> {msg.doctorNote}</div>
            </div>
          </div>
        </div>
      );
    }
    else {
      console.log("Unknown Message Bubble type", msg);
      return null;
    }
  } else if (msg.sender == SenderType.PATIENT) {
    // Message is sent by the patient
    const containerClass = "justify-end";
    const messageClass = "bg-blue-500 text-white";

    return (
      <div className={`flex ${containerClass}`}>
        <div className={`max-w-xs sm:max-w-md px-4 m-[0.25rem] py-2 rounded-lg ${messageClass}`}>
          <ReactMarkdown className="markdown">{msg.text}</ReactMarkdown>
        </div>
      </div>
    );
  } 
}
