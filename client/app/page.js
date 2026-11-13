import FolderView from '@/components/FolderView'

// root of My Files, so there is no folder id
export default function MyFilesPage() {
    return <FolderView folderId={null} />
}
