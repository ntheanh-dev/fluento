import React from 'react';
import {
    Breadcrumbs,
    Link,
    Typography
} from '@mui/material';
import {
    Home as HomeIcon,
    School as SchoolIcon,
    NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import { type Deck } from '../vocabulary';

interface BreadcrumbProps {
    selectedDeck: Deck | null;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ selectedDeck }) => {
    return (
        <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            sx={{ mb: 2 }}
        >
            <Link
                href="/"
                color="inherit"
                sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
            >
                <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                Trang chủ
            </Link>
            <Link
                href="/vocabulary"
                color="inherit"
                sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
            >
                <SchoolIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                Luyện từ vựng
            </Link>
            <Link
                href={'/vocabulary/decks'}
                color="inherit"
                sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
            >
                <SchoolIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                Decks
            </Link>
            <Typography
                color="text.primary"
                sx={{ display: 'flex', alignItems: 'center' }}
            >
                <SchoolIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                {selectedDeck ? selectedDeck.name : 'Quản lý Notes'}
            </Typography>
        </Breadcrumbs>
    );
};

export default Breadcrumb;
