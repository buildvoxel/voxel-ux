import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Collapse from '@mui/material/Collapse';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import WidgetsOutlinedIcon from '@mui/icons-material/WidgetsOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import ExtensionOutlinedIcon from '@mui/icons-material/ExtensionOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import ChevronLeftOutlinedIcon from '@mui/icons-material/ChevronLeftOutlined';
import ExpandLessOutlinedIcon from '@mui/icons-material/ExpandLessOutlined';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import { useAuthStore } from '@/store/authStore';

const drawerWidth = 240;
const collapsedWidth = 64;

interface NavItem {
  label: string;
  path?: string;
  icon: React.ReactNode;
  children?: { label: string; path: string; icon: React.ReactNode }[];
}

const navItems: NavItem[] = [
  { label: 'Home', path: '/', icon: <HomeOutlinedIcon /> },
  { label: 'Prototypes', path: '/prototypes', icon: <ScienceOutlinedIcon /> },
  {
    label: 'Repository',
    icon: <FolderOutlinedIcon />,
    children: [
      { label: 'Screens', path: '/repository/screens', icon: <ImageOutlinedIcon /> },
      { label: 'Components', path: '/repository/components', icon: <WidgetsOutlinedIcon /> },
    ],
  },
  { label: 'Product Context', path: '/context', icon: <DescriptionOutlinedIcon /> },
  { label: 'Insights', path: '/insights', icon: <InsightsOutlinedIcon /> },
  { label: 'Integrations', path: '/integrations', icon: <ExtensionOutlinedIcon /> },
  { label: 'Settings', path: '/settings', icon: <SettingsOutlinedIcon /> },
];

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [repositoryOpen, setRepositoryOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
    navigate('/login');
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const currentWidth = collapsed ? collapsedWidth : drawerWidth;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: currentWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: currentWidth,
            boxSizing: 'border-box',
            transition: 'width 0.2s ease-in-out',
            overflowX: 'hidden',
          },
        }}
      >
        {/* Logo */}
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            px: collapsed ? 1 : 2,
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ScienceOutlinedIcon sx={{ color: 'white', fontSize: 20 }} />
          </Box>
          {!collapsed && (
            <Typography variant="h6" fontWeight={600}>
              Voxel
            </Typography>
          )}
        </Toolbar>
        <Divider />

        {/* Navigation */}
        <List sx={{ flex: 1, pt: 1 }}>
          {navItems.map((item) => {
            if (item.children) {
              return (
                <Box key={item.label}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => {
                        if (collapsed) {
                          setCollapsed(false);
                          setRepositoryOpen(true);
                        } else {
                          setRepositoryOpen(!repositoryOpen);
                        }
                      }}
                      sx={{
                        minHeight: 44,
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        px: 2.5,
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: collapsed ? 0 : 2,
                          justifyContent: 'center',
                          color: isActive('/repository') ? 'primary.main' : 'inherit',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      {!collapsed && (
                        <>
                          <ListItemText
                            primary={item.label}
                            primaryTypographyProps={{
                              fontSize: 14,
                              fontWeight: isActive('/repository') ? 600 : 400,
                              color: isActive('/repository') ? 'primary.main' : 'inherit',
                            }}
                          />
                          {repositoryOpen ? <ExpandLessOutlinedIcon /> : <ExpandMoreOutlinedIcon />}
                        </>
                      )}
                    </ListItemButton>
                  </ListItem>
                  {!collapsed && (
                    <Collapse in={repositoryOpen} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {item.children.map((child) => (
                          <ListItemButton
                            key={child.path}
                            onClick={() => handleNavigate(child.path)}
                            selected={isActive(child.path)}
                            sx={{
                              pl: 4,
                              minHeight: 40,
                              '&.Mui-selected': {
                                backgroundColor: 'primary.main',
                                color: 'white',
                                '&:hover': {
                                  backgroundColor: 'primary.dark',
                                },
                                '& .MuiListItemIcon-root': {
                                  color: 'white',
                                },
                              },
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 36, fontSize: 18 }}>
                              {child.icon}
                            </ListItemIcon>
                            <ListItemText
                              primary={child.label}
                              primaryTypographyProps={{ fontSize: 13 }}
                            />
                          </ListItemButton>
                        ))}
                      </List>
                    </Collapse>
                  )}
                </Box>
              );
            }

            return (
              <ListItem key={item.label} disablePadding>
                <ListItemButton
                  onClick={() => item.path && handleNavigate(item.path)}
                  selected={item.path ? isActive(item.path) : false}
                  sx={{
                    minHeight: 44,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    px: 2.5,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: collapsed ? 0 : 2,
                      justifyContent: 'center',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontSize: 14 }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {/* Collapse Toggle */}
        <Divider />
        <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
          <IconButton onClick={() => setCollapsed(!collapsed)} size="small">
            {collapsed ? <MenuOutlinedIcon /> : <ChevronLeftOutlinedIcon />}
          </IconButton>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* App Bar */}
        <AppBar
          position="static"
          color="inherit"
          elevation={0}
          sx={{ backgroundColor: 'background.paper' }}
        >
          <Toolbar>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton onClick={handleUserMenuOpen} size="small">
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                {user?.name?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleUserMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem disabled>
                <Typography variant="body2" color="text.secondary">
                  {user?.email || 'user@example.com'}
                </Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => { handleUserMenuClose(); navigate('/settings'); }}>
                <ListItemIcon>
                  <PersonOutlinedIcon fontSize="small" />
                </ListItemIcon>
                Settings
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutOutlinedIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            backgroundColor: 'background.default',
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
