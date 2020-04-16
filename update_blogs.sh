#!/usr/bin/env bash


get_absolute_path_of_directory() {
    local dir="$1"

    if [[ -z $dir ]]; then
        echo ""
        exit 1
    fi

    local dir_stripped="${dir%/*}"
    local absolute_path=""
    if [[ $dir_stripped == $dir ]]; then
        # this means user gave just a filename:
        # ie: myscript.sh
        # instead of some sort of path/file like:
        # ./myscript.sh
        # or myfolder/myscript.sh
        # in this case, the folder is just
        # pwd
        absolute_path="$PWD"
    else
        # otherwise get it via:
        absolute_path="$(cd ${dir%/*} && pwd)"
    fi

    echo "$absolute_path"
    exit 0
}


get_paths_of_matches() {
    local search_dir="$1/"
    local match="$2"
    local absolute_path_of_search_dir="$(get_absolute_path_of_directory $search_dir)"

    search_for_match_recursively_in_directory() {
        local dir="$1"
        # iterate throught every file or directory
        # within the current dir
        for f_or_d in $dir/* ; do
            # if its a dir: recurse into that dir:
            if [[ -d $f_or_d && $f_or_d == "$absolute_path_of_search_dir"* ]]; then
                search_for_match_recursively_in_directory "$f_or_d"

            # otherwise check if file,
            # if its a file, AND if the actual filename
            # matches the match argument, print out the absolute path
            elif [[ -f $f_or_d ]]; then
                local file_without_path="${f_or_d##*/}"
                if [[ $file_without_path == *"$match"* ]]; then
                    echo "$f_or_d"
                fi
            fi
        done
    }

    search_for_match_recursively_in_directory "$absolute_path_of_search_dir"
}


# before this script is ran, you must decide
# on a branch that you wish to track your blogs
# for simplest usage, do:
# git checkout master
# git checkout -b blogs
# if you want the name to be something other than "blogs"
# simply modify it here:
blog_branch_name="blogs"

# name of directory to output blog posts
blog_output_dir="blog_tmp"

# modify this if you want your blogpost files
# to be named something else
blog_post_match="BLOG.md"

blog_renderer_location="$1"

if [[ ! -z $BLOG_CONFIG ]]; then
    blog_config_name="${BLOG_CONFIG#*/}"
    BLOG_CONFIG=$(get_absolute_path_of_directory "$BLOG_CONFIG")
    BLOG_CONFIG="$BLOG_CONFIG/$blog_config_name"
fi

absolute_blog_renderer_location=$(get_absolute_path_of_directory "$blog_renderer_location")

if [[ ! -d $absolute_blog_renderer_location ]]; then
    echo "failed to resolve absolute path to blog renderer location: $blog_renderer_location"
    exit 1
fi

original_path="$PWD"
repo_absolute_path=$(git rev-parse --show-toplevel)
render_homepage_absolute_path="$absolute_blog_renderer_location/render_homepage.js"
render_blog_absolute_path="$absolute_blog_renderer_location/render_blog.js"

does_blog_branch_exist=$(git rev-parse --verify --quiet "$blog_branch_name")
if [[ -z $does_blog_branch_exist ]]; then
    echo "Blog branch name \"$blog_branch_name\" does not exist."
    echo "Verify that \"$blog_branch_name\" is what you wish to use as your blogpost branch name"
    echo "If you do not want to use that as your blogpost branch name, then modify the blog_branch_name variable in this script."
    echo "Otherwise, run:"
    echo "git checkout -b $blog_branch_name"
    echo "to create it, and then try running this script again."
    exit 1
fi

cd $repo_absolute_path

current_branch_name="$(git rev-parse --abbrev-ref HEAD)"

if [[ $current_branch_name == "$blog_branch_name" ]]; then
    echo "Cannot update blogs if already on the blogs branch"
    exit 1
fi


# THIS MUST HAPPEN BEFORE WE CHECKOUT
# TO THE BLOGS BRANCH:
# recreate the homepage
# by scanning through ALL existing BLOG.md files
# including the ones not present in the git diff
# and get title and tags for each blog
# to later pass to the blog homepage rendering script
all_blogs=$(get_paths_of_matches "$repo_absolute_path" "$blog_post_match")
blog_homepage_args=()
for blog_location in $all_blogs ; do
    n=1
    while read -r line; do
        blog_homepage_args+=("$line")
        n=$((n + 1))
        if [[ $n == 3 ]]; then
            break
        fi
    done < $blog_location

    # also, we want to get the initial commit timestamp
    # this lets us render the homepage with a timestamp of when
    # each blog was initially published
    all_commits_of_file=$(git log --date=unix --pretty=format:"%cd" -- "$blog_location")
    IFS=$'\n' read -rd '' -a all_commits_array <<<"$all_commits_of_file"
    all_commits_array_len=${#all_commits_array[@]}
    last_index=$((all_commits_array_len - 1))
    # last commit in the sequence of commits from the git output
    # it is really the
    # first commit in chronological order
    last_commit_timestamp=${all_commits_array[${last_index}]}
    blog_homepage_args+=("$last_commit_timestamp")
done

git checkout "$blog_branch_name"

updated_files=$(git diff --name-only "$current_branch_name")
blog_files=()
for f in $updated_files ; do
    filename_without_path="${f##*/}"
    if [[ $filename_without_path == *"$blog_post_match"* ]]; then
        echo "blog file created/updated: $f"
        blog_files+=("$repo_absolute_path/$f")
        # need to checkout branch to get the current
        # branch version of that file
        # otherwise we would get the blogs branch
        # version, which is obviously behind the current
        # branch.
        git checkout "$current_branch_name" -- "$f"
    fi
done



echo -e "\n"
#mkdir if no existo
mkdir -p "$blog_output_dir"


# then iterate over the blog files
# that are included in the diff from blog branch
# and current branch. these are new/modified
# blog posts, so they need to be rendered
# no need to rerender ALL blog files
for blog_location in "${blog_files[@]}" ; do
    n=1
    read -r blog_title < $blog_location
    # remove first 2 characters because
    # blog title follows format: "# blog title"
    blog_title=${blog_title:2}
    # replace spaces with dashes
    blog_title=${blog_title//\ /-}
    # remove apostraphes, and commas from the filename
    blog_title=${blog_title//,}
    blog_title=${blog_title//\'}
    echo -e "blog location: $blog_location"
    blog_title_lowercase=${blog_title,,}

    # perform individual blog file rendering here
    # save it to a file thats $blog_title without html extension
    # but remove the leading #, and strip spaces, etc
    node "$render_blog_absolute_path" "$blog_location" > "$blog_output_dir/$blog_title_lowercase"
    echo -e "Done rendering $blog_title\n"
done

# perform home page rendering here:
node "$render_homepage_absolute_path" "${blog_homepage_args[@]}" > "$blog_output_dir/index.html"


# merge all diffs from current to blogs
# so that next time update_blogs is ran
# it only updates the newly modified blogs
git merge "$current_branch_name"
git checkout "$current_branch_name"

echo ""
echo "Blog files are ready for deployment"
echo "all files have been output to:"
echo "$repo_absolute_path/$blog_output_dir"
echo -e "\nIt is recommended that you:"
echo -e "\t- verify that the output seems correct"
echo -e "\t- deploy everything in the folder, ensure you use content-type text/html for all files"
echo -e "\t- delete the folder"

cd $original_path
