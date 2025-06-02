import React from 'react';
import { Typography } from '@mui/material';
import LegalPage from './LegalPage.js';

const Impressum = () => {
  const content = (
    <>
      <Typography variant="h6" gutterBottom>
        Betreiber und verantwortlich für die Inhalte dieses Shops ist:
      </Typography>
      <Typography variant="body1" paragraph>
        Growheads<br />
        Max Schön<br />
        Trachenberger Straße 14<br />
        01129 Dresden
      </Typography>
      
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Kontakt:
      </Typography>
      <Typography variant="body1" paragraph>
        E-Mail: service@growheads.de
      </Typography>
      
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Umsatzsteuer-ID:
      </Typography>
      <Typography variant="body1" paragraph>
        USt.-IdNr.: DE323017152
      </Typography>
      
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Haftungsausschluss:
      </Typography>
      <Typography variant="body1" paragraph>
        Für Inhalte von auf diesen Seiten verlinkten externen Internetadressen übernehmen wir keine Haftung. Für Inhalte betriebsfremder Domizile sind die jeweiligen Betreiber verantwortlich.
      </Typography>
      
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Urheberrechtsklausel:
      </Typography>
      <Typography variant="body1" paragraph>
        Die hier dargestellten Inhalte unterliegen grundsätzlich dem Urheberrecht und dürfen nur mit schriftlicher Genehmigung verbreitet werden.
        Die Rechte an Foto- oder Textmaterial von anderen Parteien sind durch diese Klausel weder eingeschränkt noch aufgehoben.
      </Typography>
    </>
  );

  return <LegalPage title="Impressum" content={content} />;
};

export default Impressum; 