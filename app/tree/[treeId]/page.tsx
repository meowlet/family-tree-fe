"use client";

import { Tree } from "@/component/tree/Tree";

export default function Page({ params }: { params: { treeId: string } }) {
  return (
    <div>
      <Tree treeId={params.treeId} />
    </div>
  );
}
