<?php

namespace App\Providers;

use App\Models\Blog;
use App\Models\Comment;
use App\Models\Contract;
use App\Models\Offer;
use App\Models\OfficeCase;
use App\Models\Review;
use App\Models\Story;
use App\Models\Ticket;
use App\Models\User;
use App\Policies\BlogPolicy;
use App\Policies\CommentPolicy;
use App\Policies\ContractPolicy;
use App\Policies\OfferPolicy;
use App\Policies\OfficeCasePolicy;
use App\Policies\ReviewPolicy;
use App\Policies\StoryPolicy;
use App\Policies\TicketPolicy;
use App\Policies\UserPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Gate::before(function ($user, $ability) {
            return $user->hasRole('super_admin') ? true : null;
        });

        Gate::define('admin-access', fn ($user) => $user->hasRole('admin') || $user->hasRole('super_admin'));

        Gate::define('super-admin-only', fn ($user) => $user->hasRole('super_admin'));

        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(Story::class, StoryPolicy::class);
        Gate::policy(Blog::class, BlogPolicy::class);
        Gate::policy(Comment::class, CommentPolicy::class);
        Gate::policy(Ticket::class, TicketPolicy::class);
        Gate::policy(Contract::class, ContractPolicy::class);
        Gate::policy(Offer::class, OfferPolicy::class);
        Gate::policy(OfficeCase::class, OfficeCasePolicy::class);
        Gate::policy(Review::class, ReviewPolicy::class);
    }
}
