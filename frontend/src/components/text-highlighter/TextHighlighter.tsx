import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Popper, Paper } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { QuickAddNoteModal } from '../modals';

interface TextHighlighterProps {
    children: React.ReactNode;
    className?: string;
}

interface SelectionInfo {
    text: string;
    startOffset: number;
    endOffset: number;
    rect: DOMRect;
}

const TextHighlighter: React.FC<TextHighlighterProps> = ({ children, className }) => {
    const [selectionInfo, setSelectionInfo] = useState<SelectionInfo | null>(null);
    const [showQuickAddModal, setShowQuickAddModal] = useState(false);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [selectedWord, setSelectedWord] = useState<string>('');
    const containerRef = useRef<HTMLDivElement>(null);

    // Function to check if text is English
    const isEnglishText = (text: string): boolean => {
        // Remove punctuation and check if it contains mostly English characters
        const cleanText = text.replace(/[^\w\s]/g, '').trim();
        if (cleanText.length === 0) return false;

        // Check if it contains mostly English letters (a-z, A-Z)
        const englishChars = cleanText.match(/[a-zA-Z]/g) || [];
        const totalChars = cleanText.length;

        // Consider it English if more than 70% are English characters
        return (englishChars.length / totalChars) > 0.7;
    };

    // Function to get selection info
    const getSelectionInfo = (): SelectionInfo | null => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return null;

        const range = selection.getRangeAt(0);
        const text = selection.toString().trim();

        if (!text || !isEnglishText(text)) return null;

        const rect = range.getBoundingClientRect();
        const containerRect = containerRef.current?.getBoundingClientRect();

        if (!containerRect) return null;

        return {
            text,
            startOffset: range.startOffset,
            endOffset: range.endOffset,
            rect: {
                ...rect,
                top: rect.top - containerRect.top,
                left: rect.left - containerRect.left,
                bottom: rect.bottom - containerRect.top,
                right: rect.right - containerRect.left,
                width: rect.width,
                height: rect.height,
                x: rect.x - containerRect.left,
                y: rect.y - containerRect.top,
                toJSON: rect.toJSON
            }
        };
    };

    // Handle text selection
    const handleMouseUp = () => {
        const info = getSelectionInfo();
        if (info) {
            setSelectionInfo(info);
            setAnchorEl(containerRef.current);
        } else {
            setSelectionInfo(null);
            setAnchorEl(null);
        }
    };

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Don't close if clicking on the button or popper
            const target = event.target as Node;
            if (containerRef.current &&
                !containerRef.current.contains(target) &&
                !(target as Element).closest('.MuiPopper-root') &&
                !(target as Element).closest('.MuiPaper-root')) {
                setSelectionInfo(null);
                setAnchorEl(null);
            }
        };

        // Use a small delay to prevent immediate clearing after selection
        const timeoutId = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Handle quick add note
    const handleQuickAddNote = () => {
        if (selectionInfo) {
            setSelectedWord(selectionInfo.text);
            setShowQuickAddModal(true);
            setSelectionInfo(null);
            setAnchorEl(null);
        }
    };

    const handleCloseQuickAddModal = () => {
        setShowQuickAddModal(false);
    };

    return (
        <>
            <Box
                ref={containerRef}
                className={className}
                onMouseUp={handleMouseUp}
                onMouseDown={(e) => {
                    // Prevent click outside from clearing selection immediately
                    e.stopPropagation();
                }}
                sx={{
                    position: 'relative',
                    userSelect: 'text',
                    cursor: 'text'
                }}
            >
                {children}

                {/* Quick Add Button Popper */}
                <Popper
                    open={Boolean(selectionInfo && anchorEl)}
                    anchorEl={anchorEl}
                    placement="top"
                    modifiers={[
                        {
                            name: 'offset',
                            options: {
                                offset: [0, 8],
                            },
                        },
                    ]}
                    sx={{ zIndex: 1300 }}
                >
                    <Paper
                        elevation={8}
                        sx={{
                            p: 1,
                            borderRadius: 2,
                            bgcolor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                            animation: 'fadeIn 0.2s ease-in-out'
                        }}
                    >
                        <Button
                            size="small"
                            variant="contained"
                            onClick={handleQuickAddNote}
                            sx={{
                                borderRadius: 1.5,
                                textTransform: 'none',
                                fontWeight: 'medium',
                                px: 2,
                                py: 0.5,
                                fontSize: '0.875rem',
                                bgcolor: 'primary.main',
                                '&:hover': {
                                    bgcolor: 'primary.dark',
                                }
                            }}
                        >
                            Thêm note
                        </Button>
                    </Paper>
                </Popper>
            </Box>

            {/* Quick Add Note Modal */}
            {showQuickAddModal && (
                <QuickAddNoteModal
                    open={showQuickAddModal}
                    onClose={handleCloseQuickAddModal}
                    selectedWord={selectedWord}
                />
            )}
        </>
    );
};

export default TextHighlighter;
