"use client";

import {
  Home,
  Search,
  UploadCloud,
  Settings,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import Link from "next/link";
import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock";

interface Props {
  onOpenSettings: () => void;
  onOpenUpload: () => void;
}

export default function AppDock({ onOpenSettings, onOpenUpload }: Props) {
  return (
    <div className="flex justify-center w-full my-2">
      <Dock className="items-center bg-foam/90 backdrop-blur-md border border-teal/20 rounded-full shadow-sm px-3 py-1">
        <DockItem onClick={() => {}}>
          <Link href="/" className="w-full h-full flex items-center justify-center">
            <DockLabel>Landing</DockLabel>
            <DockIcon>
              <Home className="h-4 w-4 text-teal" />
            </DockIcon>
          </Link>
        </DockItem>

        <DockItem onClick={() => {}}>
          <Link href="/app" className="w-full h-full flex items-center justify-center">
            <DockLabel>Search</DockLabel>
            <DockIcon>
              <Search className="h-4 w-4 text-teal" />
            </DockIcon>
          </Link>
        </DockItem>

        <DockItem onClick={onOpenUpload}>
          <DockLabel>Upload Doc</DockLabel>
          <DockIcon>
            <UploadCloud className="h-4 w-4 text-drift" />
          </DockIcon>
        </DockItem>

        <DockItem onClick={onOpenSettings}>
          <DockLabel>Settings</DockLabel>
          <DockIcon>
            <Settings className="h-4 w-4 text-teal" />
          </DockIcon>
        </DockItem>

        <DockItem onClick={() => {}}>
          <a
            href="https://github.com/Ameya79/Holms.git"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-full flex items-center justify-center"
          >
            <DockLabel>GitHub</DockLabel>
            <DockIcon>
              <FaGithub className="h-4 w-4 text-teal" />
            </DockIcon>
          </a>
        </DockItem>
      </Dock>
    </div>
  );
}
