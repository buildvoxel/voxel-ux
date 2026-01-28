import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined';
import { voxelColors, voxelFonts } from '@/theme/muiTheme';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    direction: 'up' | 'down';
    value: string | number;
  };
  color?: string;
}

export function StatCard({ title, value, icon, trend, color }: StatCardProps) {
  const iconColor = color || voxelColors.primary;

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography
              variant="overline"
              sx={{
                color: voxelColors.textSecondary,
                fontFamily: voxelFonts.body,
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.05em',
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              component="div"
              sx={{
                fontFamily: voxelFonts.display,
                fontWeight: 400,
                fontSize: '1.75rem',
                color: voxelColors.textPrimary,
                mt: 0.5,
              }}
            >
              {value}
            </Typography>
            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                {trend.direction === 'up' ? (
                  <TrendingUpOutlinedIcon sx={{ fontSize: 16, color: voxelColors.success }} />
                ) : (
                  <TrendingDownOutlinedIcon sx={{ fontSize: 16, color: voxelColors.error }} />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    color: trend.direction === 'up' ? voxelColors.success : voxelColors.error,
                    fontWeight: 500,
                  }}
                >
                  {trend.value}%
                </Typography>
              </Box>
            )}
          </Box>
          {icon && (
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                backgroundColor: voxelColors.bgDark,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: iconColor,
              }}
            >
              {icon}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
