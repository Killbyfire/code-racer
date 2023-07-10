"use client";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trash } from "lucide-react";
import dynamic from "next/dynamic";
import { Suspense, useState } from "react";

const DeleteConfirmation = dynamic(() => import("./confirmation"));

export default function ProfileNav({
  displayName,
  uid,
}: {
  displayName: string;
  uid: string;
}) {
  const [willDelete, setWillDelete] = useState(false);
  return (
    <>
      <div className="w-full flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
              <Icons.settings />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              title="Delete Account"
              className="cursor-pointer"
              onClick={() => setWillDelete(true)}
            >
              <Trash className="mr-2 h-4 w-4 stroke-red-500" />
              <span className="text-red-500">Delete Account</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {willDelete ? (
        <Suspense>
          <DeleteConfirmation
            setWillDelete={setWillDelete}
            displayName={displayName}
            uid={uid}
          />
        </Suspense>
      ) : null}
    </>
  );
}
