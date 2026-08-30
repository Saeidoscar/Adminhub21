<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Contract</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; }
        h1 { font-size: 18px; margin-bottom: 10px; }
        .meta { margin-bottom: 20px; }
        .meta p { margin: 4px 0; }
        .section { margin-bottom: 20px; }
        .section h2 { font-size: 14px; margin-bottom: 8px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
    </style>
</head>
<body>
    <h1>Contract: {{ $contract->title }}</h1>

    <div class="meta">
        <p><strong>Contract ID:</strong> {{ $contract->id }}</p>
        <p><strong>Status:</strong> {{ $contract->statusLabel() }}</p>
        <p><strong>Amount:</strong> {{ $contract->currency }} {{ number_format($contract->amount, 2) }}</p>
        <p><strong>Starts At:</strong> {{ $contract->starts_at?->format('Y-m-d H:i') }}</p>
        <p><strong>Ends At:</strong> {{ $contract->ends_at?->format('Y-m-d H:i') }}</p>
        <p><strong>Signed At:</strong> {{ $contract->signed_at?->format('Y-m-d H:i') }}</p>
    </div>

    @if($contract->description)
    <div class="section">
        <h2>Description</h2>
        <p>{{ $contract->description }}</p>
    </div>
    @endif

    @if(!empty($contract->milestones))
    <div class="section">
        <h2>Milestones</h2>
        <ul>
            @foreach($contract->milestones as $milestone)
                <li>{{ $milestone['title'] ?? $milestone }}</li>
            @endforeach
        </ul>
    </div>
    @endif

    @if(!empty($contract->signatures))
    <div class="section">
        <h2>Signatures</h2>
        <ul>
            @foreach($contract->signatures as $signature)
                <li>{{ $signature['name'] ?? 'Unknown' }} - {{ $signature['signed_at'] ?? 'N/A' }}</li>
            @endforeach
        </ul>
    </div>
    @endif

    <div class="section">
        <h2>Parties</h2>
        <p><strong>User:</strong> {{ $contract->user?->name ?? 'N/A' }}</p>
        <p><strong>Client:</strong> {{ $contract->client?->name ?? 'N/A' }}</p>
    </div>
</body>
</html>