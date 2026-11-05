<?php
// Redirige todo el tráfico virtual a index.html para que React Router funcione
readfile(__DIR__ . '/index.html');
