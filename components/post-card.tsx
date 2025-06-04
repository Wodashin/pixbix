import type React from "react"

interface Post {
  id: number
  title: string
  content: string
  image_url?: string
}

interface PostCardProps {
  post: Post
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <div className="border rounded-lg p-4 shadow-md">
      <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
      <p className="text-gray-700">{post.content}</p>
      {post.image_url && (
        <div className="mt-3">
          <img
            src={post.image_url || "/placeholder.svg"}
            alt="Post image"
            className="w-full max-h-96 object-cover rounded-lg border"
          />
        </div>
      )}
    </div>
  )
}

export default PostCard
