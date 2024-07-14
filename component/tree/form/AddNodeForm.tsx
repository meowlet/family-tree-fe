import React, { useState } from "react";
import { fetcher } from "@/api";
import useSWR from "swr";

interface AddNodeFormProps {
  rootNode?: string;
  treeId: string;
  parentNodeId: string | null;
  onClose: () => void;
  onSubmit: () => void;
}

export function AddNodeForm({
  rootNode,
  treeId,
  parentNodeId,
  onClose,
  onSubmit,
}: AddNodeFormProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [createNewUser, setCreateNewUser] = useState(false);
  const [newUserData, setNewUserData] = useState({
    fullName: "",
    bio: "",
    homeTown: "",
  });
  const [nodeData, setNodeData] = useState({
    gender: false,
    birthDate: "",
    deathDate: "",
    spouse: "",
    marriageDate: "",
  });

  const { data: searchResults, error } = useSWR(
    searchQuery ? `user?query=${encodeURIComponent(searchQuery)}` : null,
    fetcher.get
  );
  searchResults?.data.map((user: any) => {
    console.log(user._id, user.fullName, user.userName);
  });
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUser(userId);
    setCreateNewUser(false);
  };

  const handleCreateNewUser = () => {
    setCreateNewUser(true);
    setSelectedUser(null);
  };

  const handleNewUserDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUserData({ ...newUserData, [e.target.name]: e.target.value });
  };

  const handleNodeDataChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value =
      e.target.type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
    setNodeData({ ...nodeData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let userId = selectedUser;

    if (createNewUser) {
      const newUser = await fetcher.post("auth/signup/temp", newUserData);
      userId = newUser.data._id;
    }

    const newNodeData = rootNode
      ? {
          nodeId: rootNode,
          familyTree: treeId,
          user: userId,
          parentNode: parentNodeId,
          ...nodeData,
          gender: Boolean(nodeData.gender),
          deathDate: nodeData.deathDate || null,
          spouse: nodeData.spouse || null,
          marriageDate: nodeData.marriageDate || null,
        }
      : {
          familyTree: treeId,
          user: userId,
          parentNode: parentNodeId,
          ...nodeData,
          gender: Boolean(nodeData.gender),
          deathDate: nodeData.deathDate || null,
          spouse: nodeData.spouse || null,
          marriageDate: nodeData.marriageDate || null,
        };

    console.log(newNodeData);

    await fetcher.post("node", newNodeData);
    onSubmit();
    onClose();
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
        <button type="button" onClick={handleCreateNewUser}>
          Create New User
        </button>
      </div>

      {!createNewUser && searchResults && (
        <select onChange={(e) => handleSelectUser(e.target.value)}>
          <option value="">Select a user</option>
          {searchResults?.data.map((user: any) => (
            <option key={user._id} value={user._id}>
              {user.fullName} ({user.userName})
            </option>
          ))}
        </select>
      )}

      {createNewUser && (
        <div>
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={newUserData.fullName}
            onChange={handleNewUserDataChange}
          />
          <input
            type="text"
            name="bio"
            placeholder="Bio"
            value={newUserData.bio}
            onChange={handleNewUserDataChange}
          />
          <input
            type="text"
            name="homeTown"
            placeholder="Home Town"
            value={newUserData.homeTown}
            onChange={handleNewUserDataChange}
          />
        </div>
      )}

      <select name="gender" onChange={handleNodeDataChange}>
        <option value="false">Female</option>
        <option value="true">Male</option>
      </select>

      <input
        type="date"
        name="birthDate"
        onChange={handleNodeDataChange}
        placeholder="Birth Date"
      />
      <input
        type="date"
        name="deathDate"
        onChange={handleNodeDataChange}
        placeholder="Death Date (optional)"
      />
      <input
        type="date"
        name="marriageDate"
        onChange={handleNodeDataChange}
        placeholder="Marriage Date (optional)"
      />

      <button type="submit">Add Node</button>
      <button type="button" onClick={onClose}>
        Cancel
      </button>
    </form>
  );
}
