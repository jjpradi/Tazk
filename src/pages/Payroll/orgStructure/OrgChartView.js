import React, { useContext, useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box, Typography, Avatar, Paper, Collapse, IconButton, Chip, TextField,
  InputAdornment, Grid, ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import SearchIcon from '@mui/icons-material/Search';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import { getOrgChartAction } from 'redux/actions/orgStructure.actions';
import CommonSearch from 'utils/commonSearch';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { setSearchOrgChartAction, SearchOrgChartAction} from 'redux/actions/orgStructure.actions';
import { useDispatch } from 'react-redux';
import CreateNewButtonContext from '../../../context/CreateNewButtonContext';

// Flowchart Node Component
const FlowchartNode = ({ node, x, y, nodeWidth = 220, nodeHeight = 90 }) => {
  return (
    <g key={`node-${node.employee_id}`}>
      <rect
        x={x - nodeWidth / 2}
        y={y - nodeHeight / 2}
        width={nodeWidth}
        height={nodeHeight}
        fill="white"
        stroke="#1976d2"
        strokeWidth="2"
        rx="6"
      />
      <rect
        x={x - nodeWidth / 2}
        y={y - nodeHeight / 2}
        width={nodeWidth}
        height="30"
        fill="#1976d2"
        rx="6"
      />
      <text
        x={x}
        y={y - nodeHeight / 2 + 18}
        textAnchor="middle"
        fontSize="11"
        fontWeight="bold"
        fill="white"
      >
        {node.full_name?.substring(0, 18)}
      </text>
      <text
        x={x}
        y={y - 5}
        textAnchor="middle"
        fontSize="10"
        fill="#333"
      >
        {node.designation?.substring(0, 16)}
      </text>
      <text
        x={x}
        y={y + 8}
        textAnchor="middle"
        fontSize="9"
        fill="#666"
      >
        {node.department_name?.substring(0, 16)}
      </text>
    </g>
  );
};

// Connector Line Component
const ConnectorLine = ({ x1, y1, x2, y2 }) => {
  const midY = (y1 + y2) / 2;
  const path = `M ${x1} ${y1 + 45} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2 - 45}`;
  return (
    <path
      d={path}
      fill="none"
      stroke="#bdbdbd"
      strokeWidth="1.5"
      markerEnd="url(#arrowhead)"
    />
  );
};

// Calculate node positions with grid layout for multiple root nodes
const calculateNodePositions = (nodes, parentX = 0, parentY = 0, xOffset = 250, yOffset = 140) => {
  let positions = [];
  const rowHeight = yOffset + 100;
  const colsPerRow = 4;

  const traverse = (node, x, y, depth = 0) => {
    positions.push({ node, x, y });

    if (node.children && node.children.length > 0) {
      const childWidth = xOffset * Math.max(node.children.length - 1, 1);
      const startX = x - childWidth / 2;

      node.children.forEach((child, index) => {
        const childX = startX + index * xOffset;
        const childY = y + yOffset;
        traverse(child, childX, childY, depth + 1);
      });
    }
  };

  // Handle multiple root nodes in grid layout
  if (nodes.length > 1) {
    nodes.forEach((node, index) => {
      const row = Math.floor(index / colsPerRow);
      const col = index % colsPerRow;
      const x = 150 + col * xOffset;
      const y = 60 + row * rowHeight;
      traverse(node, x, y, 0);
    });
  } else if (nodes.length > 0) {
    traverse(nodes[0], 600, 60, 0);
  }

  return positions;
};

const OrgNode = ({ node, level = 0 }) => {
  const [expanded, setExpanded] = useState(level < 2);
  const hasChildren = node.children && node.children.length > 0; 
  return (
    <Box sx={{ ml: level > 0 ? 4 : 0 }}>
      {/* Connector line */}
      {level > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', ml: -2.5, mb: -0.5 }}>
          <Box sx={{ width: 20, height: 1, bgcolor: 'divider' }} />
        </Box>
      )}

      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          mb: 1,
          borderRadius: 2,
          border: '1px solid',
          borderColor: level === 0 ? 'primary.main' : 'divider',
          bgcolor: level === 0 ? 'primary.main' : 'background.paper',
          color: level === 0 ? 'primary.contrastText' : 'text.primary',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          maxWidth: 380,
          transition: 'box-shadow 0.2s',
          '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
        }}
      >
        <Avatar
          src={node.image || undefined}
          sx={{
            width: 40, height: 40,
            bgcolor: level === 0 ? 'primary.dark' : 'primary.light',
            fontSize: 16,
          }}
        >
          {!node.image && (node.full_name?.[0] || <PersonIcon />)}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 13, lineHeight: 1.3 }} noWrap>
            {node.full_name}
          </Typography>
          <Typography sx={{ fontSize: 11, opacity: 0.8 }} noWrap>
            {node.designation || node.employee_code}
          </Typography>
          {node.department_name && (
            <Typography sx={{ fontSize: 10, opacity: 0.7 }} noWrap>
              {node.department_name}
            </Typography>
          )}
        </Box>
        {hasChildren && (
          <IconButton
            size='small'
            onClick={() => setExpanded(!expanded)}
            sx={{ color: level === 0 ? 'primary.contrastText' : 'text.secondary' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <Typography sx={{ fontSize: 10 }}>{node.children.length}</Typography>
              {expanded ? <ExpandLessIcon fontSize='small' /> : <ExpandMoreIcon fontSize='small' />}
            </Box>
          </IconButton>
        )}
      </Paper>

      {hasChildren && (
        <Collapse in={expanded}>
          <Box sx={{ borderLeft: '2px solid', borderColor: 'divider', ml: 2.5, pl: 0 }}>
            {node.children.map((child) => (
              <OrgNode key={child.employee_id} node={child} level={level + 1} />
            ))}
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

export default function OrgChartView() {
  const [searchVal, setSearchVal] = useState('');
  const [svgDimensions, setSvgDimensions] = useState({ width: 1200, height: 800 });
  const svgRef = useRef(null);
  const dispatch = useDispatch();
  const { OrgStructureReducer: { orgChartData, departmentStats } } = useSelector((state) => state);
    const [pageSize, setPageSize] = useState(20);
       const [isApiFinished, setIsApiFinished] = useState(false);
 const {
    setModalTypeHandler,
    setLoaderStatusHandler,
    commoncookie,
    headerLocationId,
  } = useContext(CreateNewButtonContext);
  const tree = orgChartData?.tree || [];
  const flat = orgChartData?.flat || [];

  const totalEmployees = flat.length;
  const totalDepts = new Set(flat.map((e) => e.department_id).filter(Boolean)).size;

  // Calculate node positions for flowchart
  const nodePositions = calculateNodePositions(tree, 600, 60);

  // Calculate SVG dimensions with proper scaling
  useEffect(() => {
    if (nodePositions.length > 0) {
      const xs = nodePositions.map((p) => p.x);
      const ys = nodePositions.map((p) => p.y);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      const padding = 100;
      const minWidth = 1000;
      const minHeight = 600;
      const calculatedWidth = Math.max(maxX - minX + 300 + padding, minWidth);
      const calculatedHeight = Math.max(maxY - minY + 250 + padding, minHeight);
      
      setSvgDimensions({
        width: calculatedWidth,
        height: calculatedHeight,
      });
    }
  }, [nodePositions]);

   const requestSearch = (e) => {
    const val = e.target.value;
    console.log(val, 'ecefghj')
    setSearchVal(val);
      dispatch(setSearchOrgChartAction({ data: [] }));
      const payload ={
        searchString: val,
      };
      dispatch(
          SearchOrgChartAction(
            payload,
            setModalTypeHandler,
            setLoaderStatusHandler
          ),
        ); 
  };

    const cancelSearch = () => {
  
    dispatch(setSearchOrgChartAction({ data: [] }));
  
      const payload = {
        searchString: '',
       
      };
      dispatch(
        getOrgChartAction(
          payload,
          setModalTypeHandler,
          setLoaderStatusHandler,
        ),
      );
    };

  return (
    <Box>
      {/* Summary Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
              <PeopleIcon sx={{ fontSize: 28, color: 'primary.main', mb: 0.5 }} />
              <Typography sx={{ fontSize: 20, fontWeight: 700 }}>{totalEmployees}</Typography>
              <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>Total Employees</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
              <AccountTreeIcon sx={{ fontSize: 28, color: 'success.main', mb: 0.5 }} />
              <Typography sx={{ fontSize: 20, fontWeight: 700 }}>{totalDepts}</Typography>
              <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>Departments</Typography>
            </Paper>
          </Grid>
          {(departmentStats || []).slice(0, 2).map((dept) => (
            <Grid key={dept.department_id} size={{ xs: 6, sm: 3 }}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                <Typography sx={{ fontSize: 11, color: 'text.secondary', mb: 0.5 }}>{dept.department_name}</Typography>
                <Typography sx={{ fontSize: 20, fontWeight: 700 }}>{dept.employee_count}</Typography>
                <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>Employees</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ minWidth: 260, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mb: 2 }}>
          <CommonSearch
            searchVal={searchVal}
            requestSearch={requestSearch}
            cancelSearch={cancelSearch}
          />
        </Box>

      {/* Flowchart View */}
      {tree.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
          <AccountTreeIcon sx={{ fontSize: 48, mb: 1, opacity: 0.4 }} />
          <Typography>No reporting structure found. Set up reporting managers in Employee Creation.</Typography>
        </Box>
      )}

      {tree.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            p: 2,
            overflowX: 'auto',
            overflowY: 'auto',
            maxHeight: '700px',
            width: '100%',
            backgroundColor: '#fafafa',
          }}
        >
          <svg
            ref={svgRef}
            width={svgDimensions.width}
            height={svgDimensions.height}
            style={{ display: 'block', minWidth: '100%', minHeight: '100%' }}
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 10 3, 0 6" fill="#bdbdbd" />
              </marker>
            </defs>

            {/* Connector lines */}
            {nodePositions.map((position) => {
              const node = position.node;
              if (node.children && node.children.length > 0) {
                return node.children.map((child) => {
                  const childPosition = nodePositions.find((p) => p.node.employee_id === child.employee_id);
                  if (!childPosition) return null;
                  return (
                    <ConnectorLine
                      key={`line-${node.employee_id}-${child.employee_id}`}
                      x1={position.x}
                      y1={position.y}
                      x2={childPosition.x}
                      y2={childPosition.y}
                    />
                  );
                });
              }
              return null;
            })}

            {/* Nodes */}
            {nodePositions.map((position) => (
              <FlowchartNode
                key={position.node.employee_id}
                node={position.node}
                x={position.x}
                y={position.y}
              />
            ))}
          </svg>
        </Paper>
      )}
    </Box>
  );
}
