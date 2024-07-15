"use client";

import { signOut } from "next-auth/react";

const Signout = () => {
  return (
    <div className="w-full" onClick={() => signOut()}>
      Sign out
    </div>
  );
};

export default Signout;
