'use client'

import { useParams } from 'next/navigation'
import FolderView from '@/components/FolderView'

// [id] in the folder name means this page works for any folder id in the url
export default function FolderPage() {
    const { id } = useParams()

    return <FolderView folderId={id} />
}
