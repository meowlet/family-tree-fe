"use client";

import NodeInfo from "@/component/node/NodeInfo";
import { Tree } from "@/component/tree/Tree";

export default function Page({ params }: { params: { nodeId: string } }) {
  return (
    <div>
      <NodeInfo nodeId={params.nodeId} />
    </div>
  );
}
