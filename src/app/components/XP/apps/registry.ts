import type { ExplorerFolder, XPApp } from '../types';

export type FolderNode = {
    folder: ExplorerFolder;
    path: string[];
    children: FolderNode[];
    apps: XPApp[];
};

export function getDesktopApps(apps: XPApp[]): XPApp[] {
    return apps.filter((a) => a.desktop === true);
}

export function getFolderTree(folders: ExplorerFolder[], apps: XPApp[]): FolderNode[] {
    const byId = new Map<string, FolderNode>();
    for (const f of folders) {
        byId.set(f.id, { folder: f, path: [], children: [], apps: [] });
    }

    const roots: FolderNode[] = [];
    for (const f of folders) {
        const node = byId.get(f.id)!;
        if (f.parentId) {
            const parent = byId.get(f.parentId);
            if (parent) {
                parent.children.push(node);
                continue;
            }
        }
        roots.push(node);
    }

    const setPaths = (nodes: FolderNode[], parent: string[]) => {
        for (const n of nodes) {
            n.path = [...parent, n.folder.id];
            setPaths(n.children, n.path);
        }
    };
    setPaths(roots, []);

    for (const app of apps) {
        if (!app.explorerPath || app.explorerPath.length === 0) continue;
        const leafId = app.explorerPath[app.explorerPath.length - 1];
        const node = byId.get(leafId);
        if (node) node.apps.push(app);
    }

    return roots;
}

export function findFolderByPath(tree: FolderNode[], path: string[]): FolderNode | undefined {
    if (path.length === 0) return undefined;
    let nodes = tree;
    let found: FolderNode | undefined;
    for (const segment of path) {
        found = nodes.find((n) => n.folder.id === segment);
        if (!found) return undefined;
        nodes = found.children;
    }
    return found;
}
