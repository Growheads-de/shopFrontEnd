import React from 'react';
import { Typography } from '@mui/material';
import LegalPage from './LegalPage.js';

const Widerrufsrecht = () => {
  const content = (
    <>
      <Typography variant="body1" paragraph>
        Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag an dem Sie oder ein von Ihnen benannter Dritter, der nicht der Beförderer ist, die Waren in Besitz genommen haben bzw. hat.
      </Typography>
      
      <Typography variant="body1" paragraph>
        Um Ihr Widerrufsrecht auszuüben, müssen Sie uns
      </Typography>
      
      <Typography variant="body1" sx={{ ml: 2 }} paragraph>
        Growheads<br />
        Trachenberger Straße 14<br />
        01129 Dresden<br />
        E-Mail: service@growheads.de
      </Typography>
      
      <Typography variant="body1" paragraph>
        mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief, per Telefax oder E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist. Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.
      </Typography>
      
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Folgen des Widerrufs
      </Typography>
      <Typography variant="body1" paragraph>
        Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet. Wir können die Rückzahlung verweigern, bis wir die Waren wieder zurückerhalten haben oder bis Sie den Nachweis erbracht haben, dass Sie die Waren zurückgesandt haben, je nachdem, welches der frühere Zeitpunkt ist. Sie haben die Waren unverzüglich und in jedem Fall spätestens binnen vierzehn Tagen ab dem Tag, an dem Sie uns über den Widerruf dieses Vertrags unterrichten, an uns zurückzusenden oder zu übergeben. Die Frist ist gewahrt, wenn Sie die Waren vor Ablauf der Frist von vierzehn Tagen absenden. Sie tragen die unmittelbaren Kosten der Rücksendung der Waren. Sie müssen für einen etwaigen Wertverlust der Waren nur aufkommen, wenn dieser Wertverlust auf einen zur Prüfung der Beschaffenheit, Eigenschaften und Funktionsweise der Waren nicht notwendigen Umgang mit ihnen zurückzuführen ist.
      </Typography>
      
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Hinweis auf Nichtbestehen des Widerrufsrechts
      </Typography>
      <Typography variant="body1" paragraph>
        Das Widerrufsrecht besteht nicht für Waren die auf Kundenwunsch gefertigt oder zugeschnitten (Folien und Schläuche) wurden, kann aber nach Absprache gewährt werden. Düngerbehälter, bei denen das Verschlusssiegel entfernt oder durch Öffnen zerstört worden ist, sind ebenfalls vom Widerrufsrecht ausgeschlossen.
      </Typography>
    </>
  );

  return <LegalPage title="Widerrufsrecht" content={content} />;
};

export default Widerrufsrecht; 