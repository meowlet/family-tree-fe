import React, { useEffect, useState } from "react";
import { fetcher } from "@/api";
import useSWR from "swr";
import styles from "./Tree.module.css";
import { AddNodeForm } from "./form/AddNodeForm";
import { EditNodeForm } from "./form/EditForm";
import { useRouter } from "next/router";

export interface TreeProps {
  treeId: string;
}

export function Tree(props: TreeProps) {
  const {
    data: userData,
    error: userError,
    mutate: userMutate,
  } = useSWR<any>("user/me", fetcher.get);
  const currentUserId = userData?.data._id;

  const [authorizedNodes, setAuthorizedNodes] = useState<Set<string>>(
    new Set()
  );
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingNode, setEditingNode] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddSpouseForm, setShowAddSpouseForm] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [spouseSearchQuery, setSpouseSearchQuery] = useState("");
  const [selectedSpouseId, setSelectedSpouseId] = useState<string | null>(null);
  const [marriageDate, setMarriageDate] = useState("");

  const { data, error, mutate } = useSWR<any>(
    "tree/" + props.treeId,
    fetcher.get
  );

  const { data: spouseSearchResults } = useSWR(
    spouseSearchQuery
      ? `user?query=${encodeURIComponent(spouseSearchQuery)}`
      : null,
    fetcher.get
  );

  useEffect(() => {
    userMutate();
  }, []);

  useEffect(() => {
    if (data && currentUserId) {
      const nodes: any[] = data.data.treeNodes;
      const authorized = new Set<string>();

      const addAuthorizedNodes = (nodeId: string) => {
        const node = nodes.find((n) => n._id === nodeId);
        if (!node) return;

        authorized.add(nodeId);
        if (node.spouse) authorized.add(node.spouse);

        const children = nodes.filter((n) => n.parentNode === nodeId);
        children.forEach((child) => addAuthorizedNodes(child._id));
      };

      const userNode = nodes.find((n) => n.user?._id === currentUserId);
      if (userNode) {
        addAuthorizedNodes(userNode._id);
      }

      setAuthorizedNodes(authorized);
    }
  }, [data, currentUserId]);

  const isAuthorized = (nodeId: string) => {
    return authorizedNodes.has(nodeId) || treeInfo.creator === currentUserId;
  };

  const handleNodeClick = (nodeId: string) => {
    window.location.href = `/node/${nodeId}`;
  };

  const handleAddClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setShowAddForm(true);
  };

  const handleEditClick = (nodeId: string) => {
    const nodeToEdit = data.data.treeNodes.find(
      (node: any) => node._id === nodeId
    );
    setEditingNode(nodeToEdit);
    setShowEditForm(true);
  };

  const handleAddSpouseClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setShowAddSpouseForm(true);
  };

  const handleDeleteClick = async (nodeId: string) => {
    const node = data.data.treeNodes.find((n: any) => n._id === nodeId);
    if (!node) return;

    if (node.user) {
      if (window.confirm("Are you sure you want to delete this node?")) {
        try {
          await fetcher.delete(`node/${nodeId}`);
          mutate();
        } catch (error) {
          console.error("Error deleting node:", error);
          alert("Failed to delete node. Please try again.");
        }
      }
    } else {
      if (
        window.confirm(
          "This node is already deleted. Are you sure you want to permanently remove it?"
        )
      ) {
        try {
          await fetcher.delete(`node/force/${nodeId}`);
          mutate();
        } catch (error) {
          console.error("Error force deleting node:", error);
          alert("Failed to force delete node. Please try again.");
        }
      }
    }
  };

  const handleCloseAddForm = () => {
    setShowAddForm(false);
    setSelectedNodeId(null);
  };

  const handleCloseEditForm = () => {
    setShowEditForm(false);
    setEditingNode(null);
  };

  const handleCloseAddSpouseForm = () => {
    setShowAddSpouseForm(false);
    setSelectedNodeId(null);
    setSelectedSpouseId(null);
    setMarriageDate("");
    setSpouseSearchQuery("");
  };

  const handleAddFormSubmit = () => {
    mutate();
  };

  const handleEditFormSubmit = async (updatedNodeData: any) => {
    try {
      await fetcher.put(`node/${editingNode._id}`, updatedNodeData);
      mutate();
      setShowEditForm(false);
      setEditingNode(null);
    } catch (error) {
      console.error("Error updating node:", error);
      alert("Failed to update node. Please try again.");
    }
  };

  const handleSpouseSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSpouseSearchQuery(e.target.value);
  };

  const handleSpouseSelect = (userId: string) => {
    setSelectedSpouseId(userId);
  };

  const handleMarriageDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMarriageDate(e.target.value);
  };

  const handleAddSpouseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNodeId || !selectedSpouseId) return;

    try {
      await fetcher.post("node/spouse", {
        firstOneId: selectedNodeId,
        secondOneId: selectedSpouseId,
        marriageDate: marriageDate || null,
      });

      mutate();
      setShowAddSpouseForm(false);
      setSelectedNodeId(null);
      setSelectedSpouseId(null);
      setMarriageDate("");
      setSpouseSearchQuery("");
    } catch (error) {
      console.error("Error adding spouse:", error);
      alert("Failed to add spouse. Please try again.");
    }
  };

  const renderNode = (node: any, level: number) => {
    const spouse = node.spouse
      ? data.data.treeNodes.find((n: any) => n._id === node.spouse)
      : null;
    const children = data.data.treeNodes.filter(
      (n: any) => n.parentNode === node._id
    );

    const showControls = isAuthorized(node._id);

    return (
      <div key={node._id} className={styles.nodeContainer}>
        <div className={styles.nodeRow}>
          <div
            className={`${styles.node} ${
              node.user
                ? node.gender
                  ? styles.maleNode
                  : styles.femaleNode
                : styles.deletedNode
            }`}
            onMouseEnter={() => setHoveredNode(node._id)}
            onMouseLeave={() => setHoveredNode(null)}
            onClick={() => handleNodeClick(node._id)}
          >
            {node.user?.fullName || "Deleted User"}
            {hoveredNode === node._id && showControls && (
              <>
                <div className={styles.bottomButtonContainer}>
                  <div
                    className={styles.editButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(node._id);
                    }}
                  >
                    ✎
                  </div>
                  <div
                    className={styles.addButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddClick(node._id);
                    }}
                  >
                    +
                  </div>
                  <div
                    className={styles.deleteButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(node._id);
                    }}
                  >
                    🗑️
                  </div>
                </div>
                {!spouse && (
                  <div
                    className={styles.addSpouseButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddSpouseClick(node._id);
                    }}
                  >
                    ❤
                  </div>
                )}
              </>
            )}
          </div>
          {spouse && (
            <>
              <div className={styles.spouseConnector} />
              <div
                className={`${styles.node} ${
                  spouse.gender ? styles.maleNode : styles.femaleNode
                }`}
                onMouseEnter={() => setHoveredNode(spouse._id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => handleNodeClick(spouse._id)}
              >
                {spouse.user?.fullName}
                {hoveredNode === spouse._id && showControls && (
                  <div className={styles.bottomButtonContainer}>
                    <div
                      className={styles.editButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(spouse._id);
                      }}
                    >
                      ✎
                    </div>
                    <div
                      className={styles.deleteButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(spouse._id);
                      }}
                    >
                      🗑️
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        {children.length > 0 && (
          <>
            <div className={styles.verticalConnector} />
            <div className={styles.childrenContainer}>
              <div className={styles.horizontalConnector} />
              {children.map((child: any) => (
                <div key={child._id} className={styles.nodeContainer}>
                  <div className={styles.verticalConnector} />
                  {renderNode(child, level + 1)}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  if (error) return <div>{error.response.data.message}</div>;
  if (!data) return <div>Loading...</div>;

  const treeInfo: any = data.data.treeInfo;
  const rootNode = data.data.treeNodes.find(
    (node: any) => node._id === treeInfo.rootNode
  );

  return (
    <div className={styles.treeContainer}>
      <h1>{treeInfo.name}</h1>
      {rootNode ? (
        renderNode(rootNode, 0)
      ) : (
        <AddNodeForm
          rootNode={treeInfo.rootNode}
          treeId={props.treeId}
          parentNodeId={selectedNodeId}
          onClose={handleCloseAddForm}
          onSubmit={handleAddFormSubmit}
        />
      )}
      {showAddForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <AddNodeForm
              treeId={props.treeId}
              parentNodeId={selectedNodeId}
              onClose={handleCloseAddForm}
              onSubmit={handleAddFormSubmit}
            />
          </div>
        </div>
      )}
      {showAddSpouseForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Add Spouse</h2>
            <form onSubmit={handleAddSpouseSubmit}>
              <div>
                <label htmlFor="spouseSearch">Search for spouse:</label>
                <input
                  id="spouseSearch"
                  type="text"
                  value={spouseSearchQuery}
                  onChange={handleSpouseSearch}
                  placeholder="Enter name or username"
                  aria-label="Search for spouse by name or username"
                />
              </div>
              {spouseSearchResults && (
                <div>
                  <label htmlFor="spouseSelect">Select a spouse:</label>
                  <select
                    id="spouseSelect"
                    onChange={(e) => handleSpouseSelect(e.target.value)}
                    aria-label="Select a spouse from search results"
                  >
                    <option value="">Choose a spouse</option>
                    {spouseSearchResults.data.map((user: any) => (
                      <option key={user?._id} value={user?._id}>
                        {user?.fullName} ({user?.userName})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label htmlFor="marriageDate">Marriage Date:</label>
                <input
                  id="marriageDate"
                  type="date"
                  value={marriageDate}
                  onChange={handleMarriageDateChange}
                  aria-label="Enter the date of marriage"
                />
              </div>
              <div>
                <button type="submit">Add Spouse</button>
                <button type="button" onClick={handleCloseAddSpouseForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showEditForm && editingNode && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Edit Node</h2>
            <EditNodeForm
              treeId={props.treeId}
              node={editingNode}
              onClose={handleCloseEditForm}
              onSubmit={handleEditFormSubmit}
            />
          </div>
        </div>
      )}
    </div>
  );
}
