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
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="text"
          placeholder="Search user by fullName or userName"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      <select
        value={selectedUser || ""}
        onChange={(e) => handleSelectUser(e.target.value)}
      >
        <option value={node.user?._id}>{node.user?.fullName} (Current)</option>
        {filteredSearchResults?.map((user: any) => (
          <option key={user?._id} value={user?._id}>
            {user?.fullName} ({user?.userName})
          </option>
        ))}
      </select>

      <select
        name="gender"
        value={nodeData.gender.toString()}
        onChange={handleNodeDataChange}
      >
        <option value="false">Female</option>
        <option value="true">Male</option>
      </select>

      <input
        type="date"
        name="birthDate"
        value={nodeData.birthDate}
        onChange={handleNodeDataChange}
        placeholder="Birth Date"
      />
      <input
        type="date"
        name="deathDate"
        value={nodeData.deathDate}
        onChange={handleNodeDataChange}
        placeholder="Death Date (optional)"
      />
      <input
        type="date"
        name="marriageDate"
        value={nodeData.marriageDate}
        onChange={handleNodeDataChange}
        placeholder="Marriage Date (optional)"
      />

      <button type="submit">Update Node</button>
      <button type="button" onClick={onClose}>
        Cancel
      </button>
    </form>
  );
}
