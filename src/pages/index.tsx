import Layout from "@/components/Layout"
import Link from "next/link"

export default function Home() {
  return (
    <Layout>
      <div className="py-20 flex flex-col gap-6 items-center">
        <h1 className="text-3xl font-bold text-center">Next.js Auth Provider Example</h1>
        <p className="text-center">
          This example site demonstrates how to build your own authentication provider.<br />
          <span className="text-red-300">This page is not protected by authentication.</span>
        </p>
        <Link className="link" href="/protected">🔗 Protected Page</Link>
      </div>
    </Layout>
  )
}
