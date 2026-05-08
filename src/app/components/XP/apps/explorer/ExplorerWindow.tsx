import { useMemo, useState } from 'react';
import type { XPApp } from '../../types';
import { useWindowManager } from '../../WindowManager';
import { APPS, FOLDERS } from '../index';
import { findFolderByPath, getFolderTree, type FolderNode } from '../registry';

export default function ExplorerWindow() {
    const tree = useMemo(() => getFolderTree(FOLDERS, APPS), []);
    const [selectedPath, setSelectedPath] = useState<string[]>(
        tree.length ? [tree[0].folder.id] : []
    );
    const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const selectedKey = selectedPath.join('/');
    const selected = findFolderByPath(tree, selectedPath);

    const toggleExpanded = (key: string) =>
        setExpanded((prev) => ({ ...prev, [key]: !(prev[key] ?? false) }));

    const selectFolder = (path: string[]) => {
        setSelectedPath(path);
        setSelectedTileId(null);
    };

    return (
        <div
            className="explorer-window"
            onClick={() => setSelectedTileId(null)}
        >
            <div className="explorer-tree">
                <ul className="tree-root">
                    {tree.map((node) => (
                        <TreeNode
                            key={node.folder.id}
                            node={node}
                            selectedKey={selectedKey}
                            expanded={expanded}
                            onToggle={toggleExpanded}
                            onSelect={selectFolder}
                        />
                    ))}
                </ul>
            </div>
            <div className="explorer-files">
                {selected?.children.map((child) => (
                    <FolderTile
                        key={child.folder.id}
                        node={child}
                        isSelected={selectedTileId === `folder:${child.folder.id}`}
                        onSelect={() => setSelectedTileId(`folder:${child.folder.id}`)}
                        onOpen={() => selectFolder(child.path)}
                    />
                ))}
                {selected?.apps.map((app) => (
                    <AppTile
                        key={app.id}
                        app={app}
                        isSelected={selectedTileId === `app:${app.id}`}
                        onSelect={() => setSelectedTileId(`app:${app.id}`)}
                    />
                ))}
            </div>
        </div>
    );
}

function TreeNode({
    node,
    selectedKey,
    expanded,
    onToggle,
    onSelect,
}: {
    node: FolderNode;
    selectedKey: string;
    expanded: Record<string, boolean>;
    onToggle: (key: string) => void;
    onSelect: (p: string[]) => void;
}) {
    const key = node.path.join('/');
    const isSelected = key === selectedKey;
    const icon = node.folder.icon;
    const hasContents = node.children.length > 0 || node.apps.length > 0;
    const isOpen = expanded[key] ?? false;

    const label = (
        <span
            className={`tree-label${isSelected ? ' selected' : ''}`}
            onClick={(e) => {
                e.stopPropagation();
                onSelect(node.path);
            }}
        >
            {icon?.imageSrc && (
                <img className="tree-icon" src={icon.imageSrc} alt="" />
            )}
            {icon?.emoji && <span className="tree-icon-emoji">{icon.emoji}</span>}
            {node.folder.label}
        </span>
    );

    return (
        <li className="tree-node">
            <div className="tree-row">
                <span
                    className="tree-toggle"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (hasContents) onToggle(key);
                    }}
                >
                    {hasContents ? (isOpen ? '−' : '+') : ''}
                </span>
                {label}
            </div>
            {hasContents && isOpen && (
                <ul className="tree-children">
                    {node.children.map((sub) => (
                        <TreeNode
                            key={sub.folder.id}
                            node={sub}
                            selectedKey={selectedKey}
                            expanded={expanded}
                            onToggle={onToggle}
                            onSelect={onSelect}
                        />
                    ))}
                    {node.apps.map((app) => (
                        <TreeAppItem key={app.id} app={app} />
                    ))}
                </ul>
            )}
        </li>
    );
}

function TreeAppItem({ app }: { app: XPApp }) {
    const { openApp } = useWindowManager();
    const { icon } = app;
    return (
        <li className="tree-node">
            <div className="tree-row">
                <span className="tree-toggle" />
                <span
                    className="tree-label tree-app"
                    onClick={(e) => e.stopPropagation()}
                    onDoubleClick={() => void openApp(app.id)}
                    title={app.title}
                >
                    {icon.imageSrc && (
                        <img className="tree-icon" src={icon.imageSrc} alt="" />
                    )}
                    {icon.emoji && <span className="tree-icon-emoji">{icon.emoji}</span>}
                    {app.title}
                </span>
            </div>
        </li>
    );
}

function FolderTile({
    node,
    isSelected,
    onSelect,
    onOpen,
}: {
    node: FolderNode;
    isSelected: boolean;
    onSelect: () => void;
    onOpen: () => void;
}) {
    const icon = node.folder.icon ?? { label: node.folder.label, emoji: '📁' };

    return (
        <div
            className={`desktop-icon explorer-tile ${isSelected ? 'selected' : ''}`}
            onClick={(e) => {
                e.stopPropagation();
                onSelect();
            }}
            onDoubleClick={onOpen}
        >
            {icon.imageSrc && (
                <img className="desktop-icon-image" src={icon.imageSrc} alt={icon.label} />
            )}
            {icon.emoji && <span className="desktop-icon-emoji">{icon.emoji}</span>}
            <span className="desktop-icon-label">{icon.label}</span>
        </div>
    );
}

function AppTile({
    app,
    isSelected,
    onSelect,
}: {
    app: XPApp;
    isSelected: boolean;
    onSelect: () => void;
}) {
    const { openApp } = useWindowManager();
    const { icon } = app;

    return (
        <div
            className={`desktop-icon explorer-tile ${isSelected ? 'selected' : ''}`}
            onClick={(e) => {
                e.stopPropagation();
                onSelect();
            }}
            onDoubleClick={() => void openApp(app.id)}
        >
            {icon.imageSrc && (
                <img className="desktop-icon-image" src={icon.imageSrc} alt={icon.label} />
            )}
            {icon.emoji && <span className="desktop-icon-emoji">{icon.emoji}</span>}
            <span className="desktop-icon-label">{icon.label}</span>
        </div>
    );
}
