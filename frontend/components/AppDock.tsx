"use client";

import {
  Home,
  Search,
  UploadCloud,
  Settings,
  FileText,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import Link from "next/link";
import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock";

interface Props {
  onOpenSettings: () => void;
  onOpenUpload: () => void;
  docCount?: number | null;
}

export default function AppDock({ onOpenSettings, onOpenUpload, docCount }: Props) {
  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 max-w-full">
      <Dock className="items-end pb-2">
        <DockItem onClick={() => {}}>
          <Link href="/" className="w-full h-full flex items-center justify-center">
            <DockLabel>Landing</DockLabel>
            <DockIcon>
              <Home className="h-5 w-5 text-teal" />
            </DockIcon>
          </Link>
        </DockItem>

        <DockItem onClick={() => {}}>
          <Link href="/app" className="w-full h-full flex items-center justify-center">
            <DockLabel>Search</DockLabel>
            <DockIcon>
              <Search className="h-5 w-5 text-teal" />
            </DockIcon>
          </Link>
        </DockItem>

        <DockItem onClick={onOpenUpload}>
          <DockLabel>Upload Doc</DockLabel>
          <DockIcon>
            <UploadCloud className="h-5 w-5 text-drift" />
          </DockIcon>
        </DockItem>

        <DockItem onClick={onOpenSettings}>
          <DockLabel>Settings</DockLabel>
          <DockIcon>
            <Settings className="h-5 w-5 text-teal" />
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
              <FaGithub className="h-5 w-5 text-teal" />
            </DockIcon>
          </a>
        </DockItem>
      </Dock>
    </div>
  );
}
