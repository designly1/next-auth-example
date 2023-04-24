import React from 'react'
import Link from 'next/link'

export default function Footer() {
    return (
        <div className="mt-auto flex text-sm font-mono gap-2 pb-4 justify-center">
            Created by
            <Link
                className="link"
                href="https://designly.biz"
                target="_blank"
            >Designly</Link>
        </div>
    )
}
