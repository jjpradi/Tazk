/**
 * Central drag-reorder canvas area showing block list with visual previews.
 */
import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Box, IconButton, Typography, Chip } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import BlockRenderer from './BlockRenderer';
import { BLOCK_TYPES, PAPER_WIDTHS } from './builderConstants';

export default function BuilderCanvas({ blocks, selectedBlockId, onSelectBlock, onReorder, paperSize }) {
    const handleDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(blocks);
        const [moved] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, moved);
        onReorder(items);
    };

    const paperWidth = PAPER_WIDTHS[paperSize] || '210mm';
    const isThermal = paperSize?.startsWith('thermal');

    return (
        <Box sx={{
            flex: 1, overflow: 'auto', p: 2, bgcolor: '#f5f5f5',
            display: 'flex', justifyContent: 'center',
        }}>
            <Box sx={{
                width: paperWidth,
                maxWidth: '100%',
                minHeight: 400,
                bgcolor: '#fff',
                boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                p: isThermal ? 1 : 2,
                fontFamily: isThermal ? "'Courier New', monospace" : 'Arial, sans-serif',
                fontSize: isThermal ? '11px' : '12px',
            }}>
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="canvas">
                        {(provided) => (
                            <Box ref={provided.innerRef} {...provided.droppableProps}
                                sx={{ minHeight: 100 }}>
                                {blocks.map((block, index) => (
                                    <Draggable key={block.id} draggableId={block.id} index={index}>
                                        {(provided, snapshot) => (
                                            <Box
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                onClick={() => onSelectBlock(block.id)}
                                                sx={{
                                                    position: 'relative',
                                                    border: selectedBlockId === block.id
                                                        ? '2px solid #1976d2'
                                                        : '1px solid transparent',
                                                    borderRadius: 0.5,
                                                    mb: 0.5,
                                                    p: 0.5,
                                                    cursor: 'pointer',
                                                    opacity: block.enabled ? 1 : 0.4,
                                                    bgcolor: snapshot.isDragging ? '#e3f2fd' : 'transparent',
                                                    '&:hover': {
                                                        borderColor: selectedBlockId === block.id ? '#1976d2' : '#bbdefb',
                                                        '& .block-drag-handle': { opacity: 1 },
                                                    },
                                                    transition: 'border-color 0.15s',
                                                }}
                                            >
                                                {/* Drag handle + block type label */}
                                                <Box className="block-drag-handle" sx={{
                                                    display: 'flex', alignItems: 'center', gap: 0.5,
                                                    position: 'absolute', top: -1, left: -1,
                                                    opacity: selectedBlockId === block.id ? 1 : 0,
                                                    transition: 'opacity 0.15s',
                                                    zIndex: 1,
                                                }}>
                                                    <Box {...provided.dragHandleProps} sx={{
                                                        display: 'flex', alignItems: 'center',
                                                        bgcolor: '#1976d2', borderRadius: '3px 0 3px 0',
                                                        px: 0.3, py: 0.1,
                                                    }}>
                                                        <DragIndicatorIcon sx={{ fontSize: 12, color: '#fff' }} />
                                                        <Typography sx={{ fontSize: 9, color: '#fff', fontWeight: 600, mr: 0.3 }}>
                                                            {BLOCK_TYPES[block.type]?.label || block.type}
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                {/* Hidden indicator */}
                                                {!block.enabled && (
                                                    <Box sx={{ position: 'absolute', top: 2, right: 4, zIndex: 1 }}>
                                                        <VisibilityOffIcon sx={{ fontSize: 14, color: '#999' }} />
                                                    </Box>
                                                )}

                                                {/* Block content preview */}
                                                <BlockRenderer block={block} />
                                            </Box>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}

                                {blocks.length === 0 && (
                                    <Box sx={{
                                        textAlign: 'center', py: 4, color: '#999',
                                        border: '2px dashed #ddd', borderRadius: 1,
                                    }}>
                                        <Typography variant="body2">
                                            Click blocks from the left panel to start building your template
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        )}
                    </Droppable>
                </DragDropContext>
            </Box>
        </Box>
    );
}
