<?php

namespace App\Controller;

use App\Entity\Client;
use App\Entity\Invoice;
use App\Entity\ServiceOffer;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class DashboardController extends AbstractController
{
    #[Route('/', name: 'app_dashboard')]
    public function index(EntityManagerInterface $entityManager): Response
    {
        $clientRepository = $entityManager->getRepository(Client::class);
        $offerRepository = $entityManager->getRepository(ServiceOffer::class);
        $invoiceRepository = $entityManager->getRepository(Invoice::class);
        $invoices = $invoiceRepository->findAll();
        $revenue = array_sum(array_map(static fn (Invoice $invoice): int => $invoice->getAmount(), $invoices));

        $stats = [
            ['label' => 'Clients', 'value' => $clientRepository->count([]), 'hint' => 'structures fictives'],
            ['label' => 'Prestations', 'value' => $offerRepository->count([]), 'hint' => 'offres actives'],
            ['label' => 'Factures', 'value' => $invoiceRepository->count([]), 'hint' => 'suivi mensuel'],
            ['label' => 'CA simulé', 'value' => number_format($revenue, 0, ',', ' ').' EUR', 'hint' => 'données démo'],
        ];

        return $this->render('dashboard/index.html.twig', [
            'stats' => $stats,
            'invoices' => $invoices,
        ]);
    }
}
