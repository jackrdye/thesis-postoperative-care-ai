import { useState } from "react";

const RecoveryInfo = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  if (!isOpen) {
    return (
      <button onClick={toggleOpen} className="w-full text-center text-gray-500 font-bold bg-gray-100 rounded-b-lg ">
        Show Recovery Info <i className="fa-solid fa-angles-down"></i>
      </button>
    );
  }

  return (
    <div className="w-full sticky bg-white shadow-md rounded-lg">
      <div className="">
        <div className="p-4 flex justify-between">
          <div className="flex flex-col space-y-4">
            <div>
              <h2 className="text-xl font-bold">Estimated Recovery</h2>
              <p>6 Weeks 19/03/2023</p>
            </div>
            <div>
              <h2 className="text-xl font-bold">Refrain From</h2>
              <ul className="list-none list-inside">
                <li>Strenuous Exercise</li>
                <li>Intense Mouth Washing</li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col space-y-4">
            <div>
              <h2 className="text-xl font-bold">Medication</h2>
              <ul className="list-none list-inside">
                <li>Nurofen</li>
                <li>Painkillers</li>
                <li>Steroids</li>
              </ul>
            </div>
          </div>
        </div>
        <button onClick={toggleOpen} className="w-full text-center text-gray-500 font-bold rounded-b-lg bg-gray-100">
          Hide Recovery Info <i className="fa-solid fa-angles-up"></i>
        </button>
      </div>
    </div>
  );
};

export default RecoveryInfo;
