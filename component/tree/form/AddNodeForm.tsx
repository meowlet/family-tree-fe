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

  const handleNewUserDataChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
    <form onSubmit={handleSubmit} className="add-node-form">
      <h2>Add New Node</h2>

      <fieldset>
        <legend>User Selection</legend>
        <div>
          <label htmlFor="user-search">Search for existing user:</label>
          <input
            id="user-search"
            type="text"
            placeholder="Enter name or username"
            value={searchQuery}
            onChange={handleSearch}
            aria-label="Search for existing user by name or username"
          />
        </div>

        {!createNewUser && searchResults && (
          <div>
            <label htmlFor="user-select">Select user:</label>
            <select
              id="user-select"
              onChange={(e) => handleSelectUser(e.target.value)}
              aria-label="Select a user from search results"
            >
              <option value="">Choose a user</option>
              {searchResults?.data.map((user: any) => (
                <option key={user._id} value={user._id}>
                  {user.fullName} ({user.userName})
                </option>
              ))}
            </select>
          </div>
        )}

        <button type="button" onClick={handleCreateNewUser}>
          Create New User
        </button>
      </fieldset>

      {createNewUser && (
        <fieldset>
          <legend>New User Information</legend>
          <div>
            <label htmlFor="fullName">Full Name:</label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              value={newUserData.fullName}
              onChange={handleNewUserDataChange}
              required
              aria-label="Enter full name for new user"
            />
          </div>
          <div>
            <label htmlFor="bio">Bio:</label>
            <textarea
              id="bio"
              name="bio"
              value={newUserData.bio}
              onChange={handleNewUserDataChange}
              aria-label="Enter bio for new user"
            />
          </div>
          <div>
            <label htmlFor="homeTown">Home Town:</label>
            <input
              id="homeTown"
              type="text"
              name="homeTown"
              value={newUserData.homeTown}
              onChange={handleNewUserDataChange}
              aria-label="Enter home town for new user"
            />
          </div>
        </fieldset>
      )}

      <fieldset>
        <legend>Node Information</legend>
        <div>
          <label htmlFor="gender">Gender:</label>
          <select
            id="gender"
            name="gender"
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
            onChange={handleNodeDataChange}
            aria-label="Enter marriage date if applicable"
          />
        </div>
      </fieldset>

      <div className="form-actions">
        <button type="submit">Add Node</button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </form>
  );
}
