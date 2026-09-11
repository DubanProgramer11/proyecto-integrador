<?php
// servicios/ExtractorTexto.php
// Se encarga de leer el texto real dentro de PDF, DOCX y TXT.
// Este es el paso "archivo -> extracción de contenido" del flujo exigido.

use Smalot\PdfParser\Parser as ParserPDF;
use PhpOffice\PhpWord\IOFactory;

function extraerTexto(string $rutaCompleta, string $formato): string {
    switch ($formato) {
        case "txt":
            return file_get_contents($rutaCompleta);

        case "pdf":
            $parser = new ParserPDF();
            $pdf = $parser->parseFile($rutaCompleta);
            return $pdf->getText();

        case "docx":
            $phpWord = IOFactory::load($rutaCompleta);
            $texto = "";
            foreach ($phpWord->getSections() as $seccion) {
                foreach ($seccion->getElements() as $elemento) {
                    if (method_exists($elemento, "getText")) {
                        $texto .= $elemento->getText() . "\n";
                    } elseif (method_exists($elemento, "getElements")) {
                        foreach ($elemento->getElements() as $sub) {
                            if (method_exists($sub, "getText")) {
                                $texto .= $sub->getText() . " ";
                            }
                        }
                        $texto .= "\n";
                    }
                }
            }
            return $texto;

        default:
            throw new Exception("Formato no soportado para extracción: $formato");
    }
}