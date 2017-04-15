/// <reference path="../../../src/metron.framework.ts" />
/// <reference path="../../../src/metron.lists.ts" />

interface Post {
      PostID: number
    , Guid: string
    , PostTypeID: number
    , Name: string
    , Description: string
    , Active: boolean
    , DateCreated: Date
    , DateModified: Date
    , US: string
    , RowNumber: number
    , TotalCount: number
};

metron.onready(() => {
    let post: metron.list<Post> = new metron.list<Post>("Post");
    post.inject("append", "init", () => {
        console.log("Inside of an inject that does an append.");
    });
    post.init();
});
