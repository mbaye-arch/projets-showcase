<?php

namespace App\Controller;

use App\Entity\Invoice;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/factures')]
class InvoiceController extends AbstractController
{
    #[Route('', name: 'app_invoice_index')]
    public function index(EntityManagerInterface $entityManager): Response
    {
        $invoices = $entityManager->getRepository(Invoice::class)->findBy([], ['issuedAt' => 'DESC']);

        return $this->render('invoice/index.html.twig', [
            'invoices' => $invoices,
        ]);
    }
}
