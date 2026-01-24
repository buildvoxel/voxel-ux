import { useNavigate } from 'react-router-dom';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbNav({ items }: BreadcrumbNavProps) {
  const navigate = useNavigate();

  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      sx={{ mb: 2 }}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        if (isLast || !item.path) {
          return (
            <Typography key={index} color="text.primary" fontWeight={500}>
              {item.label}
            </Typography>
          );
        }

        return (
          <Link
            key={index}
            component="button"
            variant="body1"
            color="inherit"
            underline="hover"
            onClick={() => item.path && navigate(item.path)}
            sx={{ cursor: 'pointer' }}
          >
            {item.label}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}
