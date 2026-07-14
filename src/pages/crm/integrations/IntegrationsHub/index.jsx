import {Box, Button, Card, CardActions, CardContent, Grid, Tooltip, Typography} from '@mui/material';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import KeyIcon from '@mui/icons-material/Key';
import LanIcon from '@mui/icons-material/Lan';
import LanguageIcon from '@mui/icons-material/Language';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import integrationsApi from '../integrationsApi';

const getItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  return [];
};

const countActive = (payload) => {
  return getItems(payload).filter((item) => String(item?.status || '').toLowerCase() === 'active').length;
};

const isEndpointUnavailable = (error) => {
  const status = Number(error?.response?.status || 0);
  return status === 404 || status === 405 || status === 501;
};

const buildCardState = (available, activeCount, reason = '') => ({
  available,
  activeCount,
  reason,
});

const CARD_DEFINITIONS = [
  {
    key: 'apiKeys',
    title: 'API Keys',
    description: 'Create keys for external systems to ingest leads.',
    route: '/crm/integrations/api-keys',
    icon: <KeyIcon />,
  },
  {
    key: 'webhooks',
    title: 'Webhooks',
    description: 'Manage webhook endpoints and secrets.',
    route: '/crm/integrations/webhooks',
    icon: <LanIcon />,
  },
  {
    key: 'websiteForms',
    title: 'Website Forms',
    description: 'Secure forms for direct website and landing page lead capture.',
    route: '/crm/integrations/website-forms',
    icon: <LanguageIcon />,
  },
  {
    key: 'genericWebhooks',
    title: 'Zapier / Make',
    description: 'Generic webhook endpoint for automation tools.',
    route: '/crm/integrations/generic-webhooks',
    icon: <IntegrationInstructionsIcon />,
  },
  {
    key: 'csvImport',
    title: 'CSV Import',
    description: 'Bulk upload and map leads from CSV.',
    route: '/crm/integrations/imports/leads-csv',
    icon: <UploadFileIcon />,
  },
  {
    key: 'emailInbound',
    title: 'Email Inbound',
    description: 'Capture inbound email as leads from provider webhooks.',
    route: '/crm/integrations/email-inbound',
    icon: <AlternateEmailIcon />,
  },
];

export default function IntegrationsHub() {
  const navigate = useNavigate();
  const [statusMap, setStatusMap] = useState({});

  const statusFetchers = useMemo(
    () => ({
      apiKeys: async () => {
        const response = await integrationsApi.listApiKeys();
        return buildCardState(true, countActive(response?.data));
      },
      webhooks: async () => {
        const response = await integrationsApi.listWebhooks();
        return buildCardState(true, countActive(response?.data));
      },
      websiteForms: async () => {
        const response = await integrationsApi.listWebsiteForms();
        return buildCardState(true, countActive(response?.data));
      },
      genericWebhooks: async () => {
        const response = await integrationsApi.listGenericWebhooks();
        return buildCardState(true, countActive(response?.data));
      },
      csvImport: async () => buildCardState(true, null),
      emailInbound: async () => {
        const response = await integrationsApi.listEmailInbound();
        return buildCardState(true, countActive(response?.data));
      },
    }),
    [],
  );

  useEffect(() => { (async () => {
    let active = true;

    const loadStatuses = async () => {
      const results = await Promise.all(
        CARD_DEFINITIONS.map(async (card) => {
          const fetcher = statusFetchers[card.key];
          if (!fetcher) {
            return [card.key, buildCardState(false, null, 'Backend endpoint not available yet')];
          }

          try {
            return [card.key, await fetcher()];
          } catch (error) {
            if (isEndpointUnavailable(error)) {
              return [card.key, buildCardState(false, null, 'Backend endpoint not available yet')];
            }
            return [card.key, buildCardState(true, null)];
          }
        }),
      );

      if (!active) return;
      setStatusMap(Object.fromEntries(results));
    };

    loadStatuses();
    return () => {
      active = false;
    };
  })();
}, [statusFetchers]);

  return (
    <Box>
      <Card sx={{mb: 2, p: 2}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
          <SettingsEthernetIcon />
          <Typography variant='h5' sx={{fontWeight: 700}}>
            CRM Integrations
          </Typography>
        </Box>
        <Typography color='text.secondary' sx={{mt: 1}}>
          Configure inbound lead connectors and ingestion channels. Use the modules below to manage each integration.
        </Typography>
      </Card>
      <Grid container spacing={2}>
        {CARD_DEFINITIONS.map((card) => {
          const status = statusMap[card.key];
          const activeCountText = status?.activeCount === null || status?.activeCount === undefined
            ? '—'
            : String(status.activeCount);
          const disableManage = status?.available === false;

          return (
            <Grid
              key={card.key}
              size={{
                xs: 12,
                sm: 6,
                md: 4
              }}>
              <Card sx={{height: '100%', display: 'flex', flexDirection: 'column'}}>
                <CardContent sx={{pb: 1}}>
                  <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1}}>
                    {card.icon}
                    <Typography variant='h6' sx={{fontWeight: 700}}>
                      {card.title}
                    </Typography>
                  </Box>

                  <Typography color='text.secondary' sx={{minHeight: 48}}>
                    {card.description}
                  </Typography>

                  <Typography sx={{mt: 1, fontWeight: 600}}>
                    Active configs: {activeCountText}
                  </Typography>
                </CardContent>

                <CardActions sx={{mt: 'auto', px: 2, pb: 2}}>
                  <Tooltip title={disableManage ? status?.reason || 'Backend endpoint not available yet' : ''}>
                    <span>
                      <Button
                        variant='contained'
                        onClick={() => navigate(card.route)}
                        disabled={disableManage}
                      >
                        Manage
                      </Button>
                    </span>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
