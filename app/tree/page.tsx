"use client";
import * as React from "react";
import { fetcher } from "@/api";
import useSWR from "swr";
import { z } from "zod";
import styles from "./FamilyTree.module.css";
import Link from "next/link";
import useSWRMutation from "swr/mutation";
import toast from "react-hot-toast";
import { Calendar, Plus, Trash2 } from "lucide-react";

const CreateTreeSchema = z.object({
  name: z.string().min(1, "Tree name is required"),
  description: z.string().min(1, "Tree description is required"),
});

export default function FamilyTrees() {
  const { data: trees, error, mutate } = useSWR<any>("tree", fetcher.get);

  const { trigger: createTrigger } = useSWRMutation(
    "/tree",
    (url, { arg }: { arg: any }) => fetcher.post(url, arg)
  );

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [newTreeName, setNewTreeName] = React.useState("");
  const [newTreeDescription, setNewTreeDescription] = React.useState("");
  const [validationError, setValidationError] = React.useState<string | null>(
    null
  );

  console.log(trees);

  if (error)
    return <div className={styles.error}>{error.response.data.message}</div>;
  if (!trees) return <div className={styles.loading}>Loading...</div>;

  const createdTrees = trees.data.createdTrees;
  const memberTrees = trees.data.memberTrees;

  const handleCreateNewTree = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    try {
      const formResult = CreateTreeSchema.safeParse({
        name: newTreeName,
        description: newTreeDescription,
      });
      if (!formResult.success) {
        let errorMessage = "";
        formResult.error.errors.forEach((error: any) => {
          errorMessage += error.message + "\n";
        });
        setValidationError(errorMessage);
        return;
      }

      const response = await createTrigger({
        name: newTreeName,
        description: newTreeDescription,
      });
      mutate();
      toast.success((response as any).message);
      setIsModalOpen(false);
      setNewTreeName("");
      setNewTreeDescription("");
    } catch (error) {
      setValidationError(
        (error as any).response?.data?.message || "An unexpected error occurred"
      );
    }
  };

  const handleDeleteTree = async (treeId: string) => {
    if (window.confirm("Are you sure you want to delete this family tree?")) {
      try {
        const response = await fetcher.delete(`/tree/${treeId}`);

        toast.success((response as any).message);
        mutate();
      } catch (error) {
        toast.error(
          (error as any).response?.data?.message ||
            "An unexpected error occurred"
        );
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Family Trees</h1>
        <button
          className={styles.createButton}
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className={styles.buttonIcon} />
          Create New Tree
        </button>
      </div>

      <h2>Created Family Trees</h2>

      {createdTrees.length > 0 ? (
        <div className={styles.treeList}>
          {createdTrees.map((tree: any) => (
            <div key={tree._id} className={styles.treeItem}>
              <h2 className={styles.treeName}>
                <Link href={`/tree/${tree._id}`}>{tree.name}</Link>
              </h2>
              <p className={styles.treeDescription}>{tree.description}</p>
              <button
                onClick={() => handleDeleteTree(tree._id)}
                className={styles.deleteButton}
              >
                <Trash2 className={styles.buttonIcon} />
                Delete
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.noTrees}>
          {"You don't have any family trees yet."}
        </p>
      )}

      <h2>Member Family Trees</h2>

      {memberTrees.length > 0 ? (
        <div className={styles.treeList}>
          {memberTrees.map((tree: any) => (
            <div key={tree._id} className={styles.treeItem}>
              <h2 className={styles.treeName}>
                <Link href={`/tree/${tree._id}`}>{tree.name}</Link>
              </h2>
              <p className={styles.treeDescription}>{tree.description}</p>
              <button
                onClick={() => handleDeleteTree(tree._id)}
                className={styles.deleteButton}
              >
                <Trash2 className={styles.buttonIcon} />
                Delete
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.noTrees}>
          {"You don't have any family trees that you are a member of."}
        </p>
      )}

      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Create New Family Tree</h2>
            <form onSubmit={handleCreateNewTree}>
              <div className={styles.formGroup}>
                <label htmlFor="treeName" className={styles.label}>
                  Tree Name:
                </label>
                <input
                  type="text"
                  id="treeName"
                  className={styles.input}
                  value={newTreeName}
                  onChange={(e) => setNewTreeName(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="treeDescription" className={styles.label}>
                  Tree Description:
                </label>
                <textarea
                  id="treeDescription"
                  className={styles.textarea}
                  value={newTreeDescription}
                  onChange={(e) => setNewTreeDescription(e.target.value)}
                />
              </div>
              {validationError && (
                <div className={styles.error}>{validationError}</div>
              )}
              <div className={styles.modalButtons}>
                <button type="submit" className={styles.submitButton}>
                  Create Tree
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
