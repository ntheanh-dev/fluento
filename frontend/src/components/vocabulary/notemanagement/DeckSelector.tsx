import React from 'react';
import {
    Card,
    CardContent,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button
} from '@mui/material';
import {
    Add as AddIcon,
} from '@mui/icons-material';
import { type Deck } from '../vocabulary';

interface DeckSelectorProps {
    decks: Deck[];
    selectedDeck: Deck | null;
    onDeckChange: (deck: Deck) => void;
    onAddNote: () => void;
}

const DeckSelector: React.FC<DeckSelectorProps> = ({
    decks,
    selectedDeck,
    onDeckChange,
    onAddNote
}) => {
    return (
        <Card sx={{ mb: 3 }}>
            <CardContent>
                <Box display="flex" gap={2} alignItems="center">
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>Chọn Deck</InputLabel>
                        <Select
                            value={selectedDeck?.id || ''}
                            onChange={(e) => {
                                const deck = decks.find(d => d.id === e.target.value);
                                if (deck) onDeckChange(deck);
                            }}
                            label="Chọn Deck"
                        >
                            {decks.map((deck) => (
                                <MenuItem key={deck.id} value={deck.id}>
                                    {deck.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={onAddNote}
                        disabled={!selectedDeck}
                    >
                        Thêm Note
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default DeckSelector;
