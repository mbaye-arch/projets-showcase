<?php

namespace App\Controller;

use App\Entity\ServiceOffer;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/prestations')]
class ServiceOfferController extends AbstractController
{
    #[Route('', name: 'app_service_offer_index')]
    public function index(EntityManagerInterface $entityManager): Response
    {
        $offers = $entityManager->getRepository(ServiceOffer::class)->findBy([], ['category' => 'ASC']);

        return $this->render('service_offer/index.html.twig', [
            'offers' => $offers,
        ]);
    }
}
