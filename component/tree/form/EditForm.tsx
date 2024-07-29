import { fetcher } from "@/api";
import { useState } from "react";
import useSWR from "swr";

interface EditNodeFormProps {
  node: any;
  treeId: string;
  onClose: () => void;
  onSubmit: (updatedNodeData: any) => void;
}

export function EditNodeForm({
  node,
  treeId,
  onClose,
  onSubmit,
}: EditNodeFormProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(
    node.user?._id
  );
  const [nodeData, setNodeData] = useState({
    gender: node.gender,
    birthDate: node.birthDate || "",
    deathDate: node.deathDate || "",
    spouse: node.spouse || "",
    marriageDate: node.marriageDate || "",
  });

  const { data: treeData } = useSWR<any>(`tree/${treeId}`, fetcher.get);
  const existingUserIds = treeData
    ? treeData.data.treeNodes.map((n: any) => n.user?._id)
    : [];

  const { data: searchResults, error } = useSWR(
    searchQuery ? `user?query=${encodeURIComponent(searchQuery)}` : null,
    fetcher.get
  );

  const filteredSearchResults = searchResults?.data.filter(
    (user: any) =>
      !existingUserIds.includes(user?._id) || user?._id === node.user?._id
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUser(userId);
  };

  const handleNodeDataChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value =
      e.target.type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
    setNodeData({ ...nodeData, [e.target.name]: value });

    console.log(nodeData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedNodeData = {
      user: selectedUser,
      ...nodeData,
      //convert string to boolean
      gender: nodeData.gender === "true",
      deathDate: nodeData.deathDate || null,
      marriageDate: nodeData.marriageDate || null,
    };

    onSubmit(updatedNodeData);
  };

  return (
    <form onSubmit={handleSubmit} className="edit-node-form">
      <h2>Edit Node</h2>

      <fieldset>
        <legend>User Selection</legend>
        <div>
          <label htmlFor="user-search">Search for a different user:</label>
          <input
            id="user-search"
            type="text"
            placeholder="Enter name or username"
            value={searchQuery}
            onChange={handleSearch}
            aria-label="Search for a different user by name or username"
          />
        </div>

        <div>
          <label htmlFor="user-select">Select user:</label>
          <select
            id="user-select"
            value={selectedUser || ""}
            onChange={(e) => handleSelectUser(e.target.value)}
            aria-label="Select a user for this node"
          >
            <option value={node.user?._id}>
              {node.user?.fullName} (Current)
            </option>
            {filteredSearchResults?.map((user: any) => (
              <option key={user?._id} value={user?._id}>
                {user?.fullName} ({user?.userName})
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      <fieldset>
        <legend>Node Information</legend>
        <div>
          <label htmlFor="gender">Gender:</label>
          <select
            id="gender"
            name="gender"
            value={nodeData.gender.toString()}
            onChange={handleNodeDataChange}
            required
            aria-label="Select gender"
          >
            <option value="false">Female</option>
            <option value="true">Male</option>
          </select>
        </div>
        <div>
          <label htmlFor="birthDate">Birth Date:</label>
          <input
            id="birthDate"
            type="date"
            name="birthDate"
            value={nodeData.birthDate}
            onChange={handleNodeDataChange}
            required
            aria-label="Enter birth date"
          />
        </div>
        <div>
          <label htmlFor="deathDate">Death Date (optional):</label>
          <input
            id="deathDate"
            type="date"
            name="deathDate"
            value={nodeData.deathDate}
            onChange={handleNodeDataChange}
            aria-label="Enter death date if applicable"
          />
        </div>
        <div>
          <label htmlFor="marriageDate">Marriage Date (optional):</label>
          <input
            id="marriageDate"
            type="date"
            name="marriageDate"
            value={nodeData.marriageDate}
            onChange={handleNodeDataChange}
            aria-label="Enter marriage date if applicable"
          />
        </div>
      </fieldset>

      <div className="form-actions">
        <button type="submit">Update Node</button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </form>
  );
}
