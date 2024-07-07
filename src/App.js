import React from "react";
import RequestDemoForm from "./components/RequestDemoForm";

const App = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="w-full max-w-md p-8 rounded-xl bg-white border">
        <h1 className="text-2xl font-bold text-center">
          Request a Chirp AI Demo
        </h1>
        <RequestDemoForm />
      </div>
    </div>
  );
};

export default App;
