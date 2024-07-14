import React, { useEffect, useState } from "react";
import { fetcher } from "@/api";
import useSWR from "swr";
import styles from "./Tree.module.css";
import Auth from "@/util/Auth";
import { AddNodeForm } from "./form/AddNodeForm";

export interface TreeProps {
  treeId: string;
}

export function Tree(props: TreeProps) {
  const {
    data: useData,
    error: userError,
    mutate: userMutate,
  } = useSWR<any>("user/me", fetcher.get);
  useEffect(() => {
    userMutate();
  }, []);
  const currentUserId = useData?.data._id;
  console.log(currentUserId);
  const [authorizedNodes, setAuthorizedNodes] = useState<Set<string>>(
    new Set()
  );
  const [hasFullAccess, setHasFullAccess] = useState(false);

  const { data, error, mutate } = useSWR<any>(
    "tree/" + props.treeId,
    fetcher.get
  );
  useEffect(() => {
    if (data) {
      const treeInfo = data.data.treeInfo;
      const nodes: any[] = data.data.treeNodes;

      // Check if the current user is the creator or an admin
      if (
        treeInfo.creator === currentUserId ||
        treeInfo.admin.includes(currentUserId)
      ) {
        setHasFullAccess(true);
        setAuthorizedNodes(new Set(nodes.map((node) => node._id)));
      } else {
        const authorized = new Set<string>();

        const addAuthorizedNodes = (nodeId: string) => {
          const node = nodes.find((n) => n._id === nodeId);
          if (!node) return;

          authorized.add(nodeId);
          if (node.spouse) authorized.add(node.spouse);

          const children = nodes.filter((n) => n.parentNode === nodeId);
          children.forEach((child) => addAuthorizedNodes(child._id));
        };

        const userNode = nodes.find((n) => n.user._id === currentUserId);
        if (userNode) {
          addAuthorizedNodes(userNode._id);
        }

        setAuthorizedNodes(authorized);
      }
    }
  }, [data, currentUserId]);

  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddSpouseForm, setShowAddSpouseForm] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [spouseSearchQuery, setSpouseSearchQuery] = useState("");
  const [selectedSpouseId, setSelectedSpouseId] = useState<string | null>(null);
  const [marriageDate, setMarriageDate] = useState("");

  const { data: spouseSearchResults } = useSWR(
    spouseSearchQuery
      ? `user?query=${encodeURIComponent(spouseSearchQuery)}`
      : null,
    fetcher.get
  );

  if (error) return <div>{error.response.data.message}</div>;
  if (!data) return <div>Loading...</div>;

  const treeInfo: any = data.data.treeInfo;
  const nodes: any = data.data.treeNodes;

  const findChildren = (parentId: string) => {
    return nodes.filter((node: any) => node.parentNode === parentId);
  };

  const findSpouse = (spouseId: string) => {
    return nodes.find((node: any) => node._id === spouseId);
  };

  const handleAddClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setShowAddForm(true);
  };

  const handleEditClick = (nodeId: string) => {
    console.log("Edit clicked for node:", nodeId);
  };

  const handleAddSpouseClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setShowAddSpouseForm(true);
  };

  const handleSpouseSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSpouseSearchQuery(e.target.value);
  };

  const handleSpouseSelect = (userId: string) => {
    // set the node's _id of the selected user as the spouse
    setSelectedSpouseId(userId);
  };

  const handleMarriageDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMarriageDate(e.target.value);
  };

  const handleAddSpouseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNodeId || !selectedSpouseId) return;

    try {
      console.log({
        firstOneId: selectedNodeId,
        secondOneId: selectedSpouseId,
        marriageDate: marriageDate || null,
      });
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

  const handleDeleteClick = async (nodeId: string) => {
    if (window.confirm("Are you sure you want to delete this node?")) {
      try {
        await fetcher.delete(`node/${nodeId}`);
        mutate();
      } catch (error) {
        console.error("Error deleting node:", error);
        alert("Failed to delete node. Please try again.");
      }
    }
  };

  const handleCloseAddForm = () => {
    setShowAddForm(false);
    setSelectedNodeId(null);
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

  const isAuthorized = (nodeId: string) => {
    return hasFullAccess || authorizedNodes.has(nodeId);
  };

  const renderNode = (
    node: any,
    level: number,
    isDirectDescendant: boolean
  ) => {
    const spouse = node.spouse ? findSpouse(node.spouse) : null;
    const children = findChildren(node._id);

    const showAddButton =
      hasFullAccess || (isDirectDescendant && isAuthorized(node._id));
    const showAddSpouseButton =
      hasFullAccess || (!spouse && isAuthorized(node._id));

    return (
      <div key={node._id} className={styles.nodeContainer}>
        <div className={styles.nodeRow}>
          <div
            className={`${styles.node} ${
              node.gender ? styles.maleNode : styles.femaleNode
            }`}
            onMouseEnter={() => setHoveredNode(node._id)}
            onMouseLeave={() => setHoveredNode(null)}
          >
            {node.user.fullName}
            {hoveredNode === node._id &&
              (hasFullAccess || isAuthorized(node._id)) && (
                <>
                  <div
                    className={`${styles.bottomButtonContainer} ${
                      showAddButton ? "" : styles.singleButton
                    }`}
                  >
                    <div
                      className={styles.editButton}
                      onClick={() => handleEditClick(node._id)}
                    >
                      ✎
                    </div>
                    {showAddButton && (
                      <div
                        className={styles.addButton}
                        onClick={() => handleAddClick(node._id)}
                      >
                        +
                      </div>
                    )}
                    <div
                      className={styles.deleteButton}
                      onClick={() => handleDeleteClick(node._id)}
                    >
                      🗑️
                    </div>
                  </div>
                  {showAddSpouseButton && (
                    <div
                      className={styles.addSpouseButton}
                      onClick={() => handleAddSpouseClick(node._id)}
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
              >
                {spouse.user.fullName}
                {hoveredNode === spouse._id &&
                  (hasFullAccess || isAuthorized(spouse._id)) && (
                    <div className={styles.bottomButtonContainer}>
                      <div
                        className={styles.editButton}
                        onClick={() => handleEditClick(spouse._id)}
                      >
                        ✎
                      </div>
                      <div
                        className={styles.deleteButton}
                        onClick={() => handleDeleteClick(spouse._id)}
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
                  {renderNode(
                    child,
                    level + 1,
                    hasFullAccess || isAuthorized(node._id)
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const rootNode = nodes.find((node: any) => node._id === treeInfo.rootNode);

  return (
    <div className={styles.treeContainer}>
      <h1>{treeInfo.name}</h1>
      {rootNode ? (
        renderNode(rootNode, 0, true)
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
              <input
                type="text"
                placeholder="Search for spouse"
                value={spouseSearchQuery}
                onChange={handleSpouseSearch}
              />
              {spouseSearchResults && (
                <select onChange={(e) => handleSpouseSelect(e.target.value)}>
                  <option value="">Select a spouse</option>
                  {spouseSearchResults.data.map((user: any) => (
                    <option key={user._id} value={user._id}>
                      {user.fullName} ({user.userName})
                    </option>
                  ))}
                </select>
              )}
              <input
                type="date"
                value={marriageDate}
                onChange={handleMarriageDateChange}
                placeholder="Marriage Date"
              />
              <button type="submit">Add Spouse</button>
              <button type="button" onClick={handleCloseAddSpouseForm}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
