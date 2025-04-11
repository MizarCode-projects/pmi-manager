#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Website Analyzer API Server
Avvia il server Flask per l'API di analisi dei siti web
"""

import os
import sys
import logging

# Configura il logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("website_analyzer.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("website_analyzer.server")

# Importa l'app Flask dal modulo main
try:
    from main import app
except ImportError:
    from api.main import app

# Avvio del server
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    logger.info(f"Avvio del server Website Analyzer API sulla porta {port}")
    app.run(host='0.0.0.0', port=port, debug=True)
