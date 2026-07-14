import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Dialog, InputBase, Box, Typography, List, ListItemButton,
    ListItemText, Chip, IconButton, Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CloseIcon from '@mui/icons-material/Close';

const RECENT_KEY = 'tzk_menu_search_recent';
const MAX_RECENT = 5;

function getRecentItems() {
    try {
        return JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
    } catch { return []; }
}

function saveRecentItem(item) {
    const recent = getRecentItems().filter(r => r.route_path !== item.route_path);
    recent.unshift({ label: item.label, route_path: item.route_path, parent: item.parent });
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

function flattenNavigationMenus(menus) {
    const items = [];
    if (!Array.isArray(menus)) return items;

    menus.forEach(group => {
        const groupLabel = group.messageId || '';

        if (group.url) {
            items.push({
                label: groupLabel,
                route_path: group.url,
                parent: null,
                keywords: groupLabel.toLowerCase(),
            });
        }

        if (group.children) {
            group.children.forEach(child => {
                const childLabel = child.messageId || '';

                if (child.type === 'item' && child.url) {
                    items.push({
                        label: childLabel,
                        route_path: child.url,
                        parent: groupLabel,
                        keywords: `${groupLabel} ${childLabel}`.toLowerCase(),
                    });
                }

                if (child.children) {
                    child.children.forEach(grandchild => {
                        const gcLabel = grandchild.messageId || '';
                        if (grandchild.url) {
                            items.push({
                                label: gcLabel,
                                route_path: grandchild.url,
                                parent: `${groupLabel} > ${childLabel}`,
                                keywords: `${groupLabel} ${childLabel} ${gcLabel}`.toLowerCase(),
                            });
                        }
                    });
                }
            });
        }
    });

    return items;
}

function fuzzyMatch(query, text) {
    const q = query.toLowerCase();
    const t = text.toLowerCase();
    if (t.includes(q)) return 2;
    const words = q.split(/\s+/);
    if (words.every(w => t.includes(w))) return 1;
    return 0;
}

export default function MenuSearch({ open, onClose, navigationMenus }) {
    const navigate = useNavigate();
    const inputRef = useRef(null);
    const listRef = useRef(null);
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);

    const allItems = useMemo(() => flattenNavigationMenus(navigationMenus || []), [navigationMenus]);

    const results = useMemo(() => {
        if (!query.trim()) return [];
        return allItems
            .map(item => ({ ...item, score: fuzzyMatch(query, item.keywords) }))
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score);
    }, [query, allItems]);

    const recentItems = useMemo(() => {
        if (query.trim()) return [];
        return getRecentItems();
    }, [query, open]);

    const displayItems = query.trim() ? results : recentItems;

    useEffect(() => {
        if (open) {
            setQuery('');
            setActiveIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    useEffect(() => { setActiveIndex(0); }, [query]);

    useEffect(() => {
        if (listRef.current && displayItems.length > 0) {
            const active = listRef.current.querySelector(`[data-index="${activeIndex}"]`);
            if (active) active.scrollIntoView({ block: 'nearest' });
        }
    }, [activeIndex]);

    const handleSelect = (item) => {
        saveRecentItem(item);
        onClose();
        navigate(item.route_path);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(i => Math.min(i + 1, displayItems.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && displayItems.length > 0) {
            e.preventDefault();
            handleSelect(displayItems[activeIndex]);
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '12px',
                    overflow: 'hidden',
                    position: 'fixed',
                    top: '15%',
                    m: 0,
                    maxHeight: '460px',
                }
            }}
            slotProps={{ backdrop: { sx: { backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' } } }}
        >
            {/* Search Input */}
            <Box sx={{
                display: 'flex', alignItems: 'center', px: 2, py: 1.2,
                borderBottom: '1px solid', borderColor: 'divider',
            }}>
                <SearchIcon sx={{ color: 'text.secondary', mr: 1.5, fontSize: 22 }} />
                <InputBase
                    inputRef={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search menus..."
                    fullWidth
                    sx={{ fontSize: '15px', fontWeight: 400 }}
                />
                {query && (
                    <IconButton size="small" onClick={() => setQuery('')} sx={{ mr: 0.5 }}>
                        <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                )}
                <Chip
                    label="ESC"
                    size="small"
                    variant="outlined"
                    onClick={onClose}
                    sx={{ fontSize: '10px', height: 22, cursor: 'pointer', color: 'text.secondary', borderColor: 'divider' }}
                />
            </Box>

            {/* Results */}
            <Box ref={listRef} sx={{ overflow: 'auto', maxHeight: 360 }}>
                {!query.trim() && recentItems.length > 0 && (
                    <Typography variant="caption" sx={{
                        px: 2, pt: 1.2, pb: 0.5, display: 'block',
                        color: 'text.secondary', fontWeight: 600, fontSize: '10px',
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                    }}>
                        Recent
                    </Typography>
                )}

                {displayItems.length > 0 ? (
                    <List dense sx={{ py: 0.5 }}>
                        {displayItems.map((item, i) => (
                            <ListItemButton
                                key={item.route_path + i}
                                data-index={i}
                                selected={i === activeIndex}
                                onClick={() => handleSelect(item)}
                                onMouseEnter={() => setActiveIndex(i)}
                                sx={{
                                    mx: 1, borderRadius: '6px', mb: 0.3, py: 0.8,
                                    '&.Mui-selected': {
                                        bgcolor: 'action.selected',
                                        '&:hover': { bgcolor: 'action.selected' },
                                    },
                                }}
                            >
                                <ListItemText
                                    primary={item.label}
                                    secondary={item.parent}
                                    primaryTypographyProps={{ fontSize: '13px', fontWeight: 500 }}
                                    secondaryTypographyProps={{ fontSize: '11px', color: 'text.disabled' }}
                                />
                                {i === activeIndex && (
                                    <KeyboardReturnIcon sx={{ fontSize: 14, color: 'text.disabled', ml: 1 }} />
                                )}
                            </ListItemButton>
                        ))}
                    </List>
                ) : query.trim() ? (
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '13px' }}>
                            No results for "{query}"
                        </Typography>
                    </Box>
                ) : !recentItems.length ? (
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '13px' }}>
                            Start typing to search menus
                        </Typography>
                    </Box>
                ) : null}
            </Box>

            {/* Footer hints */}
            <Box sx={{
                display: 'flex', alignItems: 'center', gap: 2,
                px: 2, py: 0.8, borderTop: '1px solid', borderColor: 'divider',
                bgcolor: 'grey.50',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ArrowUpwardIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                    <ArrowDownwardIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                    <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '10px' }}>Navigate</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <KeyboardReturnIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                    <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '10px' }}>Open</Typography>
                </Box>
            </Box>
        </Dialog>
    );
}
