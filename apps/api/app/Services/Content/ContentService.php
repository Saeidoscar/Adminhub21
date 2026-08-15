<?php

namespace App\Services\Content;

use App\Models\Story;
use App\Models\Blog;
use App\Models\Tag;
use App\Actions\Content\PublishStoryAction;
use App\Actions\Content\UnpublishStoryAction;
use App\Actions\Content\PublishBlogAction;
use App\Actions\Content\ModerateCommentAction;
use App\Actions\Content\ManageTagsAction;

class ContentService
{
    public function __construct(
        private readonly PublishStoryAction $publishStory,
        private readonly UnpublishStoryAction $unpublishStory,
        private readonly PublishBlogAction $publishBlog,
        private readonly ModerateCommentAction $moderateComment,
        private readonly ManageTagsAction $manageTags,
    ) {}

    public function publishStory(Story $story): Story
    {
        return $this->publishStory->execute($story);
    }

    public function unpublishStory(Story $story): Story
    {
        return $this->unpublishStory->execute($story);
    }

    public function publishBlog(Blog $blog): Blog
    {
        return $this->publishBlog->execute($blog);
    }

    /**
     * @param  array<int, array{name: string, slug: string, type?: string|null}>  $tags
     * @return array<int, Tag>
     */
    public function manageTags(array $tags): array
    {
        return $this->manageTags->execute($tags);
    }
}
