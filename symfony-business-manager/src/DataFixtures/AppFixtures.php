<?php

namespace App\DataFixtures;

use App\Entity\Client;
use App\Entity\Invoice;
use App\Entity\ServiceOffer;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        foreach ($this->clients() as $data) {
            $client = (new Client())
                ->setName($data['name'])
                ->setCity($data['city'])
                ->setSector($data['sector'])
                ->setStatus($data['status']);

            $manager->persist($client);
        }

        foreach ($this->offers() as $data) {
            $offer = (new ServiceOffer())
                ->setTitle($data['title'])
                ->setCategory($data['category'])
                ->setMonthlyPrice($data['monthlyPrice']);

            $manager->persist($offer);
        }

        foreach ($this->invoices() as $data) {
            $invoice = (new Invoice())
                ->setReference($data['reference'])
                ->setAmount($data['amount'])
                ->setStatus($data['status'])
                ->setIssuedAt(new \DateTimeImmutable($data['issuedAt']));

            $manager->persist($invoice);
        }

        $manager->flush();
    }

    /**
     * @return array<int, array{name: string, city: string, sector: string, status: string}>
     */
    private function clients(): array
    {
        return [
            ['name' => 'North Digital', 'city' => 'Lille', 'sector' => 'Software', 'status' => 'active'],
            ['name' => 'Atlas Services', 'city' => 'Paris', 'sector' => 'Consulting', 'status' => 'active'],
            ['name' => 'Nova Retail', 'city' => 'Lyon', 'sector' => 'Retail', 'status' => 'inactive'],
            ['name' => 'Data Harbor', 'city' => 'Nantes', 'sector' => 'Data', 'status' => 'active'],
        ];
    }

    /**
     * @return array<int, array{title: string, category: string, monthlyPrice: int}>
     */
    private function offers(): array
    {
        return [
            ['title' => 'Maintenance applicative', 'category' => 'Support', 'monthlyPrice' => 450],
            ['title' => 'Dashboard KPI', 'category' => 'Data', 'monthlyPrice' => 700],
            ['title' => 'Back-office métier', 'category' => 'Web', 'monthlyPrice' => 900],
        ];
    }

    /**
     * @return array<int, array{reference: string, amount: int, status: string, issuedAt: string}>
     */
    private function invoices(): array
    {
        return [
            ['reference' => 'INV-2026-001', 'amount' => 1200, 'status' => 'paid', 'issuedAt' => '2026-01-15'],
            ['reference' => 'INV-2026-002', 'amount' => 850, 'status' => 'pending', 'issuedAt' => '2026-02-12'],
            ['reference' => 'INV-2026-003', 'amount' => 1600, 'status' => 'paid', 'issuedAt' => '2026-03-10'],
            ['reference' => 'INV-2026-004', 'amount' => 700, 'status' => 'late', 'issuedAt' => '2026-04-05'],
        ];
    }
}

