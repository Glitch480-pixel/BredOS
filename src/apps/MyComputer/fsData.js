// A fully fake, in-memory filesystem for flavor. Nothing here touches disk;
// it exists only to make My Computer feel populated. Text files route to
// Notepad using the real (persisted) notepadDocs content in the store.

export const FS_TREE = {
  name: 'C:\\',
  type: 'drive',
  children: [
    {
      name: 'My Documents',
      type: 'folder',
      children: [
        { name: 'readme.txt', type: 'textfile' },
        { name: 'todo.txt', type: 'textfile' },
        { name: 'recipe.txt', type: 'textfile' },
        { name: 'diary.txt', type: 'textfile' },
        {
          name: 'My Pictures',
          type: 'folder',
          children: [
            { name: 'toast_vacation.bmp', type: 'image' },
            { name: 'crumb_family.bmp', type: 'image' },
          ],
        },
      ],
    },
    {
      name: 'Program Files',
      type: 'folder',
      children: [
        { name: 'BredStore', type: 'folder', children: [{ name: 'bredstore.exe', type: 'binary' }] },
        { name: 'BredExplorer', type: 'folder', children: [{ name: 'bredexplorer.exe', type: 'binary' }] },
      ],
    },
    {
      name: 'Windows',
      type: 'folder',
      children: [
        { name: 'system32', type: 'folder', children: [{ name: 'toaster.dll', type: 'binary' }] },
        { name: 'crumbs.ini', type: 'binary' },
      ],
    },
    { name: 'Local Disk (D:)', type: 'binary' },
  ],
}

export function findNode(path) {
  // path: array of names starting after the drive root, e.g. ['My Documents']
  let node = FS_TREE
  for (const seg of path) {
    node = node.children?.find((c) => c.name === seg)
    if (!node) return null
  }
  return node
}
