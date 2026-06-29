<?php

namespace Database\Factories;

use App\Models\Deal;
use App\Models\DealDocument;
use Illuminate\Database\Eloquent\Factories\Factory;

class DealDocumentFactory extends Factory
{
    protected $model = DealDocument::class;

    public function definition(): array
    {
        return [
            'deal_id' => Deal::factory(),
            'document_type' => $this->faker->randomElement(['GST Certificate', 'ID Proof', 'Partnership Deed']),
            'file_path' => 'deals/mock_file.pdf',
            'file_name' => 'mock_file.pdf',
            'file_size' => 102400,
            'mime_type' => 'application/pdf',
            'verification_status' => 'pending',
        ];
    }
}
