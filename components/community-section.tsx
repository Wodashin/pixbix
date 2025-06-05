"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

interface Comment {
  id: number
  text: string
  user_email: string
  created_at: string
}

const CommentSection = ({ postId }: { postId: string }) => {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const { data: session } = useSession()

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}/comments`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setComments(data)
      } catch (error) {
        console.error("Could not fetch comments:", error)
      }
    }

    fetchComments()
  }, [postId])

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": session?.user?.email || "",
        },
        body: JSON.stringify({ text: newComment }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const newCommentData = await response.json()
      setComments([...comments, newCommentData])
      setNewComment("")
    } catch (error) {
      console.error("Could not create comment:", error)
    }
  }

  return (
    <div>
      <h3>Comments</h3>
      {session ? (
        <form onSubmit={handleCommentSubmit}>
          <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." />
          <button type="submit">Post Comment</button>
        </form>
      ) : (
        <p>Sign in to leave a comment.</p>
      )}
      {comments.map((comment) => (
        <div key={comment.id}>
          <p>{comment.text}</p>
          <p>
            By: {comment.user_email} on {new Date(comment.created_at).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  )
}

export default CommentSection
